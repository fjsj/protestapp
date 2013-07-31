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
  var today = SelectedDate.getAsMoment();
  if (today) {
    return {
      'currentDate': SelectedDate.getFormatted(),
      'fbEvents': Facebook.getEventsByDate(today)
    };
  } else {
    return null;
  }
};

/*
 * Template context of selected date (plus 1 day) events.
 */
Template.tomorrowEvents.tomorrowContext = function () {
  var tomorrow = SelectedDate.getTomorrowAsMoment();
  if (tomorrow) {
    return {
      'currentDate': SelectedDate.getTomorrowFormatted(),
      'fbEvents': Facebook.getEventsByDate(tomorrow)
    };
  } else {
    return null;
  }
};
