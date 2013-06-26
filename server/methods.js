var fbDateFormats = ["YYYY-MM-DDThh:mm:ssZZ", "YYYY-MM-DD", "YYYY-MM-DDThh:mm:ss"];
var protestRegex = /protesto|protesta|manifestação|reforma|movimento |luta | ato |greve|paralização|boicote|revolução|revolta|ocupa|marcha|impeachment|vem pra rua|vem para as ruas|massa crítica|direitos urbanos|primavera brasileira|#vemprarua|#changebrazil|#forafeliciano|pec37|pec 37|pec33|pec 33|cura gay|curagay|anonymous/i

Meteor.methods({
  insertEvents: function (events) {
    check(events, [Object]);
    _.each(events, function (ev) {
      if (ev.name.search(protestRegex) !== -1) {  // if is a protest event
        // convert start_time and end_time to Date
        ev.start_time = moment(ev.start_time, fbDateFormats).toDate();
        if (ev.end_time) {
          ev.end_time = moment(ev.end_time, fbDateFormats).toDate();
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
});