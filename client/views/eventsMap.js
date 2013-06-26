Template.eventsMap.rendered = function() {
  var mapOptions = {
    zoom: 12,
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

  Session.set('eventsMapRendered', true);

  Deps.autorun(function () {
    var isRendered = Session.get('eventsMapRendered');
    if (isRendered) {
      var todayKey = SelectedDate.getAsKey();
      if (todayKey) {
        var tomorrowKey = SelectedDate.getTomorrowAsKey();
        var todayEvents = Facebook.getEventsByDate(todayKey).fetch();
        var tomorrowEvents = Facebook.getEventsByDate(tomorrowKey).fetch();
        _(todayEvents.concat(tomorrowEvents)).each(function (ev) {
          if (ev.venue && ev.venue.latitude && ev.venue.longitude) {
            var marker = new google.maps.Marker({
              position: new google.maps.LatLng(ev.venue.latitude, ev.venue.longitude),
              title: ev.name,
              eventId: ev.id
            });
            marker.setMap(map);
          }
        });
      }
    }
  });
};

Template.eventsMap.destroyed = function() {
  Session.set('eventsMapRendered', false);
};