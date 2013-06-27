/*
 * ifIsNull template helper.
 * Template equivalent of if (value === null).
 */
Handlebars.registerHelper('ifIsNull', function (value, options) {
  if (value === null) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

/*
 * formatDate template helper.
 * Converts from Date to local (current language) time and date format string.
 */
Handlebars.registerHelper('formatDate', function (value) {
  var localFormat = I18N.getDateFormat();
  return moment(value).format("HH:mm " + localFormat);
});

/*
 * Convert new line (\n\r) to <br>.
 * See: https://github.com/danharper/Handlebars-Helpers/blob/master/helpers.js
 */
Handlebars.registerHelper('nl2br', function(text) {
  var nl2br = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
  return new Handlebars.SafeString(nl2br);
});

/**
 * jQuery-based helpers.
 * scrollTo and scrollToIfHidden provide smooth scrolling functionality.
 * forceAllToSameHeight forces .step-fluid content columns to have the same height.
 */
$helpers = (function () {
  var isScrolledIntoView = function (selector, fully) {
    // See: http://stackoverflow.com/a/488073/145349
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(selector).offset().top;
    var elemBottom = elemTop + $(selector).height();

    var isVisible = (elemBottom <= docViewBottom) && (elemTop >= docViewTop);
    if (fully) {
      isVisible = isVisible && (elemBottom >= docViewTop) && (elemTop <= docViewBottom);
    }
    return isVisible;
  };

  var scrollTo = function (selector) {
    var $viewport = $('html, body');

    $viewport.animate({
      scrollTop: $(selector).offset().top
    }, 500);

    // Stop the animation if the user scrolls. Defaults on .stop() should be fine
    // See: http://stackoverflow.com/a/10144683/145349
    $viewport.bind("scroll mousedown DOMMouseScroll mousewheel keyup", function (e) {
      if (e.which > 0 || e.type === "mousedown" || e.type === "mousewheel") {
        // This identifies the scroll as a user action, stops the animation, then unbinds the event straight after (optional)
        $viewport.stop().unbind('scroll mousedown DOMMouseScroll mousewheel keyup');
      }
    });
  };

  var scrollToIfHidden = function (selector, partially, destinationSelector) {
    if (!isScrolledIntoView(selector, partially)) {
      scrollTo(destinationSelector);
    }
  };

  var forceAllToSameHeight = function (selector) {
    if ($(".step-fluid").css("display") === "inline-block") {
      $(selector).css("min-height", '');
      var heights = [];
      $(selector).each(function () {
        heights.push($(this).height());
      });
      var maxHeight = _.max(heights);
      $(selector).css("min-height", maxHeight);
    }
  };

  return {
    scrollTo: scrollTo,
    scrollToIfHidden: scrollToIfHidden,
    forceAllToSameHeight: forceAllToSameHeight
  };
}());

ViewHelper = (function () {
  var initializeFacebookSDK = function () {
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
    initializeFacebookSDK: initializeFacebookSDK,
    showLoginPopup: showLoginPopup
  };
}());
