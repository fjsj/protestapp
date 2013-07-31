this.Tests = do ->
  testList = []

  add = (t) -> testList.push(t)

  runAll = ->
    # Get it at: https://graph.facebook.com/oauth/access_token?client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&grant_type=client_credentials
    APP_ACCESS_TOKEN = prompt("Please input your APP_ACCESS_TOKEN")
    test APP_ACCESS_TOKEN for test in testList

  return {
    add: add,
    runAll: runAll
  }
