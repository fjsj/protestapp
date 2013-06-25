Events = new Meteor.Collection("events");

Meteor.publish("all-events", function () {
  return Events.find();
});