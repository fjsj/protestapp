/**
 * Geolocation namespace.
 * Exposes functions to find and get the current geolocation.
 *
 * Since getter functions use Meteor Session internally,
 * if they are used in reactive contexts, their returned values are updated automagically.
 */
Geolocation = (function () {
  var getShowAll = function () {
    return Session.get("showAll");
  };

  var setShowAll = function (showAll) {
    Session.set("showAll", showAll);
  };

  var get = function () {
    return Session.get("geolocation") || null;
  };

  var set = function (latlng) {
    Session.set("geolocation", latlng);
  };

  var clear = function () {
    Session.set("geolocation", null);
  };

  var find = function () {
    if (geoPosition.init()) {
      var successCallback = function (p) {
        setShowAll(false);
        set(p);
      };

      var errorCallback = function () {
        alert("Erro ao tentar acessar sua localização.");
      };

      geoPosition.getCurrentPosition(successCallback, errorCallback, { enableHighAccuracy: true });
    } else {
      alert("Erro ao tentar acessar sua localização.");
    }
  };

  return {
    getShowAll: getShowAll,
    setShowAll: setShowAll,
    find: find,
    get: get,
    clear: clear
  };
}());

/*
 * geolocation template helper.
 * Let template code to get the current geolocation (if exists).
 */
Handlebars.registerHelper("geolocation", function () {
  return Geolocation.get();
});

Geolocation.find();
