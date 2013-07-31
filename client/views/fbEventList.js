/*
 * Fix CSS columns issue by forcing both .day-content to same height.
 */
Template.todayEvents.rendered = function() {
  $helpers.forceAllToSameHeight(".day-content");
};

/*
 * Template context of selected date events.
 */
Template.todayEvents.todayContext = function () {
  var todayKey = SelectedDate.getAsKey();
  if (todayKey) {
    return {
      'currentDate': SelectedDate.getFormatted(),
      'fbEvents': Facebook.getEventsByDate(todayKey)
    };
  } else {
    return null;
  }
};

/*
 * Template context of selected date (plus 1 day) events.
 */
Template.tomorrowEvents.tomorrowContext = function () {
  var todayKey = SelectedDate.getAsKey();
  if (todayKey) {
    var tomorrowKey = SelectedDate.getTomorrowAsKey();
    return {
      'currentDate': SelectedDate.getTomorrowFormatted(),
      'fbEvents': Facebook.getEventsByDate(tomorrowKey)
    };
  } else {
    return null;
  }
};
