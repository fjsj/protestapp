/*
 * Loads the Facebook JavaScript SDK when fbEvent template is created.
 */
Template.fbEvent.created = function () {
  FacebookViewHelper.initializeSDK();
};

/*
 * Fix CSS columns issue by forcing both .event-content to same height.
 */
Template.fbEvent.rendered = function () {
  $helpers.forceAllToSameHeight(".event-content");
};

/*
 * Description template variable.
 * This variable is updated as soon as event description is fully fetched.
 *
 * Reactive context! Values are updated automatically,
 * since Facebook namespace uses Meteor Session internaly,
 * which is a reactive data source.
 */
Template.fbEvent.description = function () {
  return Facebook.getEventDescription(this.id);
};

/*
 * Attendee count template variable.
 * This variable is updated as soon as event attendee count is fully fetched.
 *
 * Reactive context! Values are updated automatically,
 * since Facebook namespace uses Meteor Session internaly,
 * which is a reactive data source.
 */
Template.fbEvent.attendeeCount = function () {
  return Facebook.getEventAttendeeCount(this.id);
};

/*
 * Attendees template variable.
 * This variable is updated as soon as event attendees are fully fetched.
 *
 * Reactive context! Values are updated automatically,
 * since Facebook namespace uses Meteor Session internaly,
 * which is a reactive data source.
 */
Template.fbEvent.attendees = function () {
  return Facebook.getEventAttendees(this.id);
};

/*
 * Male ratio template variable.
 * This variable is updated as soon as event attendees are fully fetched.
 *
 * Reactive context! Values are updated automatically,
 * since Facebook namespace uses Meteor Session internaly,
 * which is a reactive data source.
 */
Template.fbEvent.maleRatio = function () {
  var attendees = Facebook.getEventAttendees(this.id);
  if (attendees && attendees.length) {
    // when calculating ratio, discard attendees which have no gender data
    attendees = _.filter(attendees, function (a) { return a.hasOwnProperty("gender"); });
    if (attendees.length) {
      var total = attendees.length;
      var males = _.reduce(attendees, function (memo, a) { return memo + (a.gender === "male" ? 1 : 0); }, 0);
      return Math.floor((males / total) * 100);
    }
  }
  return null;
};

/*
 * Event click events.
 * Clicking in .btn-login opens the Facebook JavaScript SDK login pop-up.
 */
Template.fbEvent.events({
  "click .btn-login": function () {
    FacebookViewHelper.showLoginPopup();
  }
});

/*
 * Female ratio template helper.
 * Receives the maleRatio and calculates the
 * femaleRatio by doing 100 - maleRatio.
 * Returns null while maleRatio is not available.
 */
Template.fbEvent.helpers({
  femaleRatio: function (maleRatio) {
    return maleRatio ? 100 - maleRatio : null;
  }
});
