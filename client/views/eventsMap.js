/*
 * Rendering of events map. Using Google Maps JavaScript API V3.
 */
Template.eventsMap.rendered = function() {
  var mapOptions = {
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById("events-map-canvas"), mapOptions);
  var infowindow = new google.maps.InfoWindow({ content: '...' });
  var markersArray = [];
  var geolocation = Geolocation.get();
  var myPosition = null;

  // If user geolocation was found, center map in it and add a marker with it to the map.
  if (geolocation && geolocation.coords && geolocation.coords.latitude && geolocation.coords.longitude) {
    var lat = geolocation.coords.latitude;
    var lng = geolocation.coords.longitude;
    myPosition = new google.maps.LatLng(lat, lng);
    map.setCenter(myPosition);

    var marker = new google.maps.Marker({
      position: myPosition,
      title: 'Sua localização',
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });
    marker.setMap(map);

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.content = 'Você está aqui!';
      infowindow.open(map, marker);
    });
  } else {
    // Since user geolocation isn't available, center map in Brazil capital.
    map.setCenter(new google.maps.LatLng(-15.779039, -47.928071));  // Brasília LatLng
    map.setZoom(3);
  }
  Session.set('eventsMapRendered', true);

  // Start of helper functions to use in map updates.
  var clearMarkers = function () {
    // Based on: https://developers.google.com/maps/documentation/javascript/overlays#RemovingOverlays
    if (markersArray) {
      for (var i in markersArray) {
        markersArray[i].setMap(null);
      }
      markersArray.length = 0;
    }
  };

  var fitToAllMarkers = function () {
    if (markersArray) {
      var bounds = new google.maps.LatLngBounds();

      for (var i in markersArray) {
        bounds.extend(markersArray[i].getPosition());
      }
      if (!bounds.isEmpty()) {
        if (myPosition) {
          bounds.extend(myPosition);
        }
        map.setCenter(bounds.getCenter());
        map.fitBounds(bounds);
      }
    }
  };
  // End of helper functions to use in map updates.

  /*
   * Automatically updates map when user login status change or when listed events change.
   * See: http://docs.meteor.com/#deps_autorun
   */
  Deps.autorun(function () {
    var isRendered = Session.get('eventsMapRendered');
    var isLogged = Facebook.getAccessToken();

    if (isRendered && isLogged) {
      var today = SelectedDate.getAsMoment();
      if (today) {
        var tomorrow = SelectedDate.getTomorrowAsMoment();
        var todayEvents = Facebook.getEventsByDate(today).fetch();
        var tomorrowEvents = Facebook.getEventsByDate(tomorrow).fetch();

        clearMarkers();
        var addMarker = function (ev, isToday) {
          if (ev.venue && ev.venue.latitude && ev.venue.longitude) {
            var marker = new google.maps.Marker({
              position: new google.maps.LatLng(ev.venue.latitude, ev.venue.longitude),
              title: ev.name,
              eventId: ev.id,
              icon: 'http://maps.google.com/mapfiles/ms/icons/' + (isToday ? 'green' : 'yellow') + '-dot.png'
            });
            marker.setMap(map);
            markersArray.push(marker);

            google.maps.event.addListener(marker, 'click', function() {
              infowindow.content = Template.eventInfoWindow(ev);
              infowindow.open(map, marker);
            });
          }
        };
        _(todayEvents).each(function (ev) {
          addMarker(ev, true);
        });
        _(tomorrowEvents).each(function (ev) {
          addMarker(ev, false);
        });
        fitToAllMarkers();
      }
    }
  });
};

Template.eventsMap.destroyed = function() {
  Session.set('eventsMapRendered', false);
};