/*
 * Events filter click events.
 * Clicking in #show-near will show only nearby geolocation events.
 * Clicking in #show-all will show all events.
 */
Template.eventsFilter.events({
  "click #show-near": function () {
    Geolocation.setShowAll(false);
  },
  "click #show-all": function () {
    Geolocation.setShowAll(true);
  }
});
