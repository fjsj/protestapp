/**
 * Facebook namespace.
 * Exposes the most important functionalities of this app.
 *
 * Since getter functions use Meteor Session internally,
 * if they are used in reactive contexts, their returned values are updated automagically.
 *
 * login and logout respectively sets and clear the current logged user Facebook access token.
 * getAccessToken returns the logged user (if exists) access token.
 * getUserName works similarly, but returns user's real name.
 * getEventsByDate retuns a list of fetched events objects at a given date, if events were already fetched.
 * * The given date format follows the keyFormat defined in SelectedDate (see selectedDate.js).
 * getEvent returns the event object with the provided id (and starts to fetch its attendees in background).
 * getEventAttendees returns the attendees array of the event with the provided id, if those attendees were already fetched.
 * getEventDescription and getEventAttendeeCount returns event description and attendeeCount if they were already fetched.
 * 
 * Events objects are fetched automatically every time access token changes,
 * since the internal fetchEvents function is in a autorun context.
 */
Facebook = (function () {
  var fbDateFormats = ["YYYY-MM-DDThh:mm:ssZZ", "YYYY-MM-DD", "YYYY-MM-DDThh:mm:ss"];
  var sessionKeys = {};

  // Start of generic private Session functions
  var sessionGetOrNull = function (key) {
    return Session.get(key) || null;
  };
  var sessionSet = function (key, value) {
    Session.set(key, value);
    sessionKeys[key] = true;
  };
  // End of generic private Session functions

  // Start of public general functions
  var getFbDateFormats = function () {
    return _.clone(fbDateFormats); // clone it to avoid accidental changes
  };

  var login = function (accessToken) {
    return sessionSet("accessToken", accessToken);
  };

  var logout = function () {
    // Clear all sessionKeys, including current accessToken, userName and datesAndEvents.
    _.each(_.keys(sessionKeys), function (k) {
      Session.set(k, null);
    });
    sessionKeys = {};
  };

  var getAccessToken = function () {
    return sessionGetOrNull("accessToken");
  };

  var getUserName = function () {
    return sessionGetOrNull("userName");
  };

  var setUserName = function (userName) {
    sessionSet("userName", userName);
  };
  // End of public general functions

  // Start of functions related to event objects
  var facebookHttpGet = function (url, callback) {
    var verifyAndCallback = function (error, result) {
      // Check if accessToken was valid at request time
      if (result.statusCode == 400) {
        var json = JSON.parse(result.content);
        // Invalid request! Expired accessToken.
        // Page refresh is necessary to reload Facebook JavaScript SDK.
        if (json.error.type == "OAuthException") {
          window.location.reload();
        }
      } else {
        callback(error, result);
      }
    };
    
    // if is Internet Explorer use jsonp for cross-site requests
    if (IE_VERSION) {
      $.ajax({
        url: url,
        timeout: 30000,
        dataType: 'jsonp',
        success: function (data, textStatus, jqXHR) {
          verifyAndCallback({}, {
            statusCode: jqXHR.status,
            content: JSON.stringify(data)
          });
        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
      });
    } else {
      Meteor.http.get(url, {timeout: 30000}, verifyAndCallback);
    }
  };

  var fetchEvents = function () {
    var accessToken = getAccessToken();
    if (accessToken !== null) {
      var url = "https://graph.facebook.com/me?fields=name";
      url += "&access_token=" + accessToken;
      
      facebookHttpGet(url, function (error, result) {
        if (result.statusCode === 200) {
          var json = JSON.parse(result.content);
          setUserName(json.name);
          var geolocation = Geolocation.get();
          var showAll = Geolocation.getShowAll();

          if (geolocation && !showAll) {
            Session.set('loadingEventsCollection', true);
          }
          /* 
           * Meteor server method 'fetchEvents' will fetch events from Facebook.
           * Events collection will be populated after this method is done.
           * See server/methods.js
           */
          Meteor.call('fetchEvents', accessToken, function () {
            Session.set('loadingEventsCollection', false);
          });
        }
      });
    }
  };

  /*
   * Rerun fetchEvents when access token changes.
   * See: http://docs.meteor.com/#deps_autorun
   */
  Deps.autorun(fetchEvents);

  // Events collection which will be populated by 'fetchEvents' server method.
  Events = new Meteor.Collection("events");
  
  /*
   * Rerun Meteor.subscribe over events to change visible Events if geolocation or showAll option changes.
   * See: http://docs.meteor.com/#deps_autorun
   */
  Deps.autorun(function () {
    var geolocation = Geolocation.get();
    var showAll = Geolocation.getShowAll();

    Session.set('loadingEventsCollection', true);
    if (geolocation && !showAll) {
      Meteor.subscribe("near-events", geolocation, function () {
        Session.set('loadingEventsCollection', false);
      });
    } else {
      Meteor.subscribe("all-events", function () {
        Session.set('loadingEventsCollection', false);
      });
    }
  });

  var getEventsByDate = function (dateKey) {
    var startMoment = moment(dateKey, SelectedDate.getKeyFormat());
    var start = startMoment.toDate();
    var end = startMoment.clone().add('days', 1).toDate();
    return Events.find({ start_time: { '$gte': start, '$lt': end } }, { sort: { 'start_time': 1 } });
  };

  var getEvent = function (id) {
    try {
      var fbEvent = Events.findOne({ 'id': id });
      if (fbEvent) {
        if (getAccessToken()) {
          fetchAndStoreEventAttendees(id);
          fetchAndStoreEventDescription(id);
          fetchAndStoreEventAttendeeCount(id);
        }
        return fbEvent;
      } else {
        // if event couldn't be found, maybe it is not near...
        if (!Geolocation.getShowAll()) {
          // so subscribe to all events.
          Geolocation.setShowAll(true);
        }
        return null;
      }
    } catch (e) {
      return null;
    }
  };
  // End of functions related to event objects

  // Start of functions related to event attendees
  var fetchAndStoreEventAttendees = function (id) {
    var accessToken = getAccessToken();
    // Using Facebook Graph API Field Expansion, that's why this is a huge URL.
    // See: https://developers.facebook.com/docs/reference/api/field_expansion/
    var url = "https://graph.facebook.com/" + id + "?fields=attending.limit(1000).fields(name,gender,picture.width(50).height(50))";
    url += "&access_token=" + accessToken;
    facebookHttpGet(url, processAttendees);
  };

  var processAttendees = function (error, result) {
    if (result.statusCode === 200) {
      var json = JSON.parse(result.content);
      var attending = json.attending ? json.attending.data : [];
      storeEventAttendees(json.id, attending);
    }
  };

  var storeEventAttendees = function (id, attendeesList) {
    sessionSet("attendees" + id, attendeesList);
  };

  var getEventAttendees = function (id) {
    return sessionGetOrNull("attendees" + id);
  };
  // End of functions related to event attendees

  // Start of functions related to event description
  var fetchAndStoreEventDescription = function (id) {
    var accessToken = getAccessToken();
    var url = "https://graph.facebook.com/" + id + "?fields=description";
    url += "&access_token=" + accessToken;
    facebookHttpGet(url, processDescription);
  };

  var processDescription = function (error, result) {
    if (result.statusCode === 200) {
      var json = JSON.parse(result.content);
      var description = json.description ? json.description : "";
      storeEventDescription(json.id, description);
    }
  };

  var storeEventDescription = function (id, description) {
    sessionSet("description" + id, description);
  };

  var getEventDescription = function (id) {
    return sessionGetOrNull("description" + id);
  };
  // End of functions related to event description
  
  // Start of functions related to event attendee count
  var fetchAndStoreEventAttendeeCount = function (id) {
    var accessToken = getAccessToken();
    var url = "https://graph.facebook.com/fql?q=SELECT%20eid%2C%20attending_count%20FROM%20event%20WHERE%20eid%20%3D%20" + id + "&format=json";
    url += "&access_token=" + accessToken;
    facebookHttpGet(url, processAttendeeCount);
  };

  var processAttendeeCount = function (error, result) {
    if (result.statusCode === 200) {
      var json = JSON.parse(result.content);
      
      if (json.data && json.data[0] && json.data[0].eid && json.data[0].attending_count) {
        var eid = json.data[0].eid;
        var attendeeCount = json.data[0].attending_count;
        storeEventAttendeeCount(eid, attendeeCount);
      }
    }
  };

  var storeEventAttendeeCount = function (id, attendeeCount) {
    sessionSet("attendeeCount" + id, attendeeCount);
  };

  var getEventAttendeeCount = function (id) {
    return sessionGetOrNull("attendeeCount" + id);
  };
  // End of functions related to event attendee count

  return {
    getFbDateFormats: getFbDateFormats,
    login: login,
    getAccessToken: getAccessToken,
    getUserName: getUserName,
    getEventsByDate: getEventsByDate,
    getEvent: getEvent,
    getEventAttendees: getEventAttendees,
    getEventDescription: getEventDescription,
    getEventAttendeeCount: getEventAttendeeCount,
    logout: logout
  };
}());

/*
 * isLogged template helper.
 * Let template code know if user is logged.
 */
Handlebars.registerHelper("isLogged", function () {
  return Facebook.getAccessToken() !== null;
});

/*
 * loadingEventsCollection template helper.
 * Let template code know if events are loading.
 */
Handlebars.registerHelper("loadingEventsCollection", function () {
  return Session.get('loadingEventsCollection');
});

/**
 * Facebook view helper to use in JS view code. 
 * Exposes a function to initialize Facebook JS SDK and another function to show Facebook login popup.
 */
FacebookViewHelper = (function () {
  var initializeSDK = function () {
    // See Facebook JavaScript JDK docs at: https://developers.facebook.com/docs/reference/javascript/
    window.fbAsyncInit = function() {
      // Init the FB JS SDK
      var initConfig = {
        appId      : AppConfig.appId, // App ID from the App Dashboard
        status     : false, // check the login status upon init?
        cookie     : false, // set sessions cookies to allow your server to access the session?
        xfbml      : false  // parse XFBML tags on this page?
      };
      if (!AppConfig.isLocalhost) { // Serve channel.html file only on production
        initConfig["channelUrl"] = Meteor.absoluteUrl("fb/channel.html");
      }
      FB.init(initConfig);

      // Sync Facebook login status with this app login status (automatically logging in if necessary).
      FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
          Facebook.login(response.authResponse.accessToken);
        } else if (response.status === 'not_authorized') {
          // not_authorized
        } else {
          // not_logged_in
        }
      });
    };

    // Load the SDK's source Asynchronously
    (function(d, debug){
       var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement('script'); js.id = id; js.async = true;
       js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
       ref.parentNode.insertBefore(js, ref);
     }(document, /*debug*/ false));
  };

  var showLoginPopup = function () {
    FB.login(function(response) {
      if (response.authResponse) {
        Facebook.login(response.authResponse.accessToken);
      } else {
        // cancelled
      }
    }, {scope: 'user_events,friends_events'});
  };

  return {
    initializeSDK: initializeSDK,
    showLoginPopup: showLoginPopup
  };
}());
