Template.main.events({
  "click #show-near": function () {
    Geolocation.setShowAll(false);
  },
  "click #show-all": function () {
    Geolocation.setShowAll(true);
  }
});
