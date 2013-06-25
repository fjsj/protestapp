Geolocation = (function () {
  var getShowAll = function () {
    return Session.get("showAll");
  };

  var setShowAll = function (showAll) {
    Session.set("showAll", showAll);
  };

  var find = function () {
    if (geoPosition.init()) {
      var successCallback = function (p) {
        Geolocation.setShowAll(false);
        Geolocation.set(p);
      };

      var errorCallback = function () {
        alert("Erro ao tentar acessar sua localização.");
      };

      geoPosition.getCurrentPosition(successCallback, errorCallback, { enableHighAccuracy: true });
    } else {
      alert("Erro ao tentar acessar sua localização.");
    }
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

  return {
    getShowAll: getShowAll,
    setShowAll: setShowAll,
    find: find,
    get: get,
    set: set,
    clear: clear
  };
}());

Handlebars.registerHelper("geolocation", function () {
  return Geolocation.get();
});

Geolocation.find();
