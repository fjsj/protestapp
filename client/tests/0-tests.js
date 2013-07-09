Tests = (function () {
  var testList = [];

  var add = function (t) {
    testList.push(t);
  };

  var runAll = function () {
    // Get it at: https://graph.facebook.com/oauth/access_token?client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&grant_type=client_credentials
    var APP_ACCESS_TOKEN = prompt("Please input your APP_ACCESS_TOKEN");
    _.each(testList, function (t) {
      t(APP_ACCESS_TOKEN);
    });
  };

  return {
    add: add,
    runAll: runAll
  };
}());
