Events = new Meteor.Collection("events");

Meteor.publish("near-events", function (geolocation) {
  check(geolocation, Match.Any);
  if (geolocation && geolocation.coords && geolocation.coords.latitude && geolocation.coords.longitude) {
    var lng = geolocation.coords.longitude;
    var lat = geolocation.coords.latitude;
    var lnglatCondition = { $near: { $geometry: { type: 'Point', coordinates: [lng, lat] } }, $maxDistance: 50000 };
    return Events.find({ lnglat: lnglatCondition });
  } else {
    return Events.find();
  }
});

Meteor.publish("all-events", function () {
  return Events.find();
});

Meteor.startup(function () {
  Events._ensureIndex({ lnglat: '2dsphere' });
});
