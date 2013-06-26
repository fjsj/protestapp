Template.eventsMap.rendered = function() {
  var mapOptions = {
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById("events-map-canvas"), mapOptions);
  var geolocation = Geolocation.get();

  if (geolocation && geolocation.coords && geolocation.coords.latitude && geolocation.coords.longitude) {
    var lat = geolocation.coords.latitude;
    var lng = geolocation.coords.longitude;
    map.setCenter(new google.maps.LatLng(lat, lng));

    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      title: 'Sua localização',
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });
    marker.setMap(map);
  }
};
