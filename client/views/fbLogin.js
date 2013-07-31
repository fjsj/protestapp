/*
 * Loads the Facebook JavaScript SDK when fbLogin template is created.
 */
Template.fbLogin.created = function () {
  FacebookViewHelper.initializeSDK();
};

/*
 * Current user template variables.
 */
Template.fbLogin.userName = function () {
  return Facebook.getUserName() || '';
};

/*
 * Facebook login click events.
 * Clicking in #login-button opens the Facebook JavaScript SDK login pop-up.
 * Clicking in #logout-button logs out the user from Facebook and from this app.
 */
Template.fbLogin.events({
  "click #login-button": function () {
    FacebookViewHelper.showLoginPopup();
  },
  "click #logout-button": function () {
    FB.logout(function(response) {
      // logged out
    });
    Facebook.logout();
  }
});
