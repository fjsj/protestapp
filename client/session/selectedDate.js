/**
 * SelectedDate namespace.
 * Exposes functions that get and set the currently selected date.
 *
 * Since getter functions use Meteor Session internally,
 * if they are used in reactive contexts, their returned values are updated automagically.
 *
 * A date is selected through the datepicker (see datepicker.js).
 */
SelectedDate = (function () {
  var keyFormat = "YYYY-MM-DD";

  var getAsKey = function () {
    return Session.get("selectedDate");
  };

  var getAsMoment = function () {
    var asKey = getAsKey();
    return asKey ? moment.utc(asKey, keyFormat) : null;
  };
  
  var getFormatted = function () {
    var asMoment = getAsMoment();
    var localFormat = I18N.getDateFormat();
    return asMoment ? asMoment.format(localFormat) : null;
  };

  var getTomorrowAsMoment = function () {
    var asMoment = getAsMoment();
    return asMoment ? asMoment.add("days", 1) : null;
  };

  var getTomorrowFormatted = function () {
    var tomorrowAsMoment = getTomorrowAsMoment();
    var localFormat = I18N.getDateFormat();
    return tomorrowAsMoment ? tomorrowAsMoment.format(localFormat) : null;
  };

  var setAsMoment = function (asMoment) {
    Session.set("selectedDate", asMoment.format(keyFormat));
  };
  setAsMoment(moment());
 
  return {
    getAsMoment: getAsMoment,
    getFormatted: getFormatted,
    getTomorrowAsMoment: getTomorrowAsMoment,
    getTomorrowFormatted: getTomorrowFormatted,
    setAsMoment: setAsMoment
  };
}());
