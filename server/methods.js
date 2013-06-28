var fbDateFormats = ["YYYY-MM-DDThh:mm:ssZZ", "YYYY-MM-DD", "YYYY-MM-DDThh:mm:ss"];
var fbDateToDate = function (fbDate) {
  var fbDateMoment = moment(fbDate, fbDateFormats);
  if (fbDate.length == 10 || fbDate.length == 19 /* fbDateFormats[1] or [2] */) {  // if there is no timezone...
    fbDateMoment.add('hours', 3);  // use GMT-3.
  }
  return fbDateMoment.toDate();
};
var protestRegex = /protesto|protesta|manifestação|reforma|movimento |luta | ato |greve|paralização|boicote|revolução|revolta|ocupa|marcha|impeachment|vem pra rua|vem para as ruas|massa crítica|direitos urbanos|primavera brasileira|#vemprarua|#changebrazil|#forafeliciano|pec37|pec 37|pec33|pec 33|cura gay|curagay|anonymous/i;
var jsonToEventList = function (json) {
  var eventsIds = {}; // id hashset to avoid event repetition
  var events = [];
  if (json.friends) {
    json.friends.data.forEach(function (friend) {
      if (friend.events) {
        friend.events.data.forEach(function (event) {
          if (!(eventsIds.hasOwnProperty(event.id))) { // only push events that weren't already pushed
            events.push(event);
            eventsIds[event.id] = true;
          }
        });
      }
    });
  }
  return events;
};

Meteor.methods({
  insertEvents: function (accessToken) {
    check(accessToken, String);
    this.unblock();

    var timestamp = moment().startOf("day").subtract("months", 1).unix();
    // Using Facebook Graph API Field Expansion, that's why this is a huge URL.
    // See: https://developers.facebook.com/docs/reference/api/field_expansion/
    var url = "https://graph.facebook.com/me?fields=name,friends.fields(events.since(" + timestamp + ").limit(25).fields(id,start_time,end_time,location,name,venue,picture.width(100).height(100).type(square)))";
    url += "&access_token=" + accessToken;
    
    try {
      var result = Meteor.http.get(url, {timeout: 30000});
      var json = JSON.parse(result.content);

      if (result.statusCode == 200) {
        var events = jsonToEventList(json);

        _.each(events, function (ev) {
          if (ev.name.search(protestRegex) !== -1) {  // if is a protest event
            // convert start_time and end_time to Date
            ev.start_time = fbDateToDate(ev.start_time);
            if (ev.end_time) {
              ev.end_time = fbDateToDate(ev.end_time);
            }

            // create lnglat field
            if (ev.venue && ev.venue.latitude && ev.venue.longitude) {
              ev.lnglat = { "type": "Point", "coordinates": [ev.venue.longitude, ev.venue.latitude] };
            }

            // upsert
            if (Events.find({ id: ev.id }).count() > 0) {
              Events.update({ id: ev.id }, ev);
            } else {
              Events.insert(ev);
            }
          }
        });
      }
    } catch (error) {
      var result = error.response;
      if (result.statusCode == 400) {
        // Invalid request! Expired accessToken.
        // Page refresh is necessary, to reload Facebook JavaScript SDK.
        if (json.error.type == "OAuthException") {
          // TODO: make a window.location.reload(); in client-side
        }
      }
    }
  }
});