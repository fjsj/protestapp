/*
 * Fix CSS columns issue by forcing both .day-content to same height.
 */
Template.todayEvents.rendered = function() {
  $helpers.forceAllToSameHeight(".day-content");
};

/*
 * Template context of selected date events.
 *
 * Reactive context! Values are updated automatically,
 * since SelectedDate and Facebook namespaces
 * use Meteor Session internaly,
 * which is a reactive data source.
 */
Template.todayEvents.todayContext = function () {
  var todayKey = SelectedDate.getAsKey();
  if (todayKey) {
    var fbEvents = Facebook.getEventsByDate(todayKey);
    fbEvents.observe({
      removed: function () {
        $helpers.forceAllToSameHeight(".day-content");
      }
    });

    return {
      'currentDate': SelectedDate.getFormatted(),
      'fbEvents': fbEvents
    };
  } else {
    return null;
  }
};

/*
 * Template context of selected date (plus 1 day) events.
 *
 * Reactive context! Values are updated automatically,
 * since SelectedDate and Facebook namespaces
 * use Meteor Session internaly,
 * which is a reactive data source.
 */
Template.tomorrowEvents.tomorrowContext = function () {
  var todayKey = SelectedDate.getAsKey();
  if (todayKey) {
    var tomorrowKey = SelectedDate.getTomorrowAsKey();
    var fbEvents = Facebook.getEventsByDate(tomorrowKey);
    fbEvents.observe({
      removed: function () {
        $helpers.forceAllToSameHeight(".day-content");
      }
    });

    return {
      'currentDate': SelectedDate.getTomorrowFormatted(),
      'fbEvents': fbEvents
    };
  } else {
    return null;
  }
};
