Template.eventsMap.rendered = function() {
  var mapOptions = {
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById("events-map-canvas"), mapOptions);
  var infowindow = new google.maps.InfoWindow({ content: '...' });
  var markersArray = [];
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
    markersArray.push(marker);

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.content = 'Você está aqui!';
      infowindow.open(map, marker);
    });
  } else {
    map.setCenter(new google.maps.LatLng('-15.779039', '-47.928071'));  // Brasília LatLng
    map.setZoom(3);
  }
  Session.set('eventsMapRendered', true);

  var clearMarkers = function () {
    // based on: https://developers.google.com/maps/documentation/javascript/overlays#RemovingOverlays
    if (markersArray) {
      for (var i in markersArray) {
        markersArray[i].setMap(null);
      }
      markersArray.length = 0;
    }
  };

  Deps.autorun(function () {
    var isRendered = Session.get('eventsMapRendered');
    var isLogged = Facebook.getAccessToken();

    if (isRendered && isLogged) {
      var todayKey = SelectedDate.getAsKey();
      if (todayKey) {
        var tomorrowKey = SelectedDate.getTomorrowAsKey();
        var todayEvents = Facebook.getEventsByDate(todayKey).fetch();
        var tomorrowEvents = Facebook.getEventsByDate(tomorrowKey).fetch();

        clearMarkers();
        _(todayEvents.concat(tomorrowEvents)).each(function (ev) {
          if (ev.venue && ev.venue.latitude && ev.venue.longitude) {
            var marker = new google.maps.Marker({
              position: new google.maps.LatLng(ev.venue.latitude, ev.venue.longitude),
              title: ev.name,
              eventId: ev.id
            });
            marker.setMap(map);
            markersArray.push(marker);

            google.maps.event.addListener(marker, 'click', function() {
              infowindow.content = Template.eventInfoWindow(ev);
              infowindow.open(map, marker);
            });
          }
        });
      }
    }
  });
};

Template.eventsMap.destroyed = function() {
  Session.set('eventsMapRendered', false);
};