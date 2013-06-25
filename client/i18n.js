/**
 * Internationalization namespace.
 * Exposes functions that allows translations to supported languages,
 * getting of date formats and getting and setting of currently selected language.
 */
I18N = (function () {
  var dateFormats = {
    "pt": "DD/MM/YYYY"
  };
  var datepickerFormats = {
    "pt": "dd/mm/yyyy"
  };

  var getDateFormat = function () {
    var language = getLanguage();
    return dateFormats[language];
  };

  var getDatepickerFormat = function () {
    var language = getLanguage();
    return datepickerFormats[language];
  };

  var getLanguage = function (language) {
    return Session.get("language") || "pt";
  };

  var setLanguage = function (language) {
    return Session.set("language", language);
  };

  return {
    getDateFormat: getDateFormat,
    getDatepickerFormat: getDatepickerFormat,
    getLanguage: getLanguage,
    setLanguage: setLanguage
  };
}());
