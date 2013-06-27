/*
 * Loads the Facebook JavaScript SDK when fbLogin template is created.
 */
Template.fbLogin.created = function () {
  ViewHelper.initializeFacebookSDK();
};

/*
 * Current user template variables.
 *
 * Reactive context! Values are updated automatically,
 * since Facebook namespace uses Meteor Session internaly,
 * which is a reactive data source.
 */
Template.fbLogin.userName = function () {
  return Facebook.getUserName() || '';
};

/*
 * Facebook login click events.
 * Clicking in #login-button opens the Facebook JavaScript SDK login pop-up.
 * Clicking in #logout-button logs out the user from Facebook and from this app.
 */
(function () {
  Template.fbLogin.events({
    "click #login-button": function () {
      ViewHelper.showLoginPopup();
    },
    "click #logout-button": function () {
      FB.logout(function(response) {
        // logged out
      });
      Facebook.logout();
    }
  });
}());
