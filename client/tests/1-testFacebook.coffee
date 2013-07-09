Tests.add (APP_ACCESS_TOKEN) ->
  eventDt = moment().format "YYYY-MM-DDThh:mm:ssZZ"

  # Helper functions.
  # For docs on Facebook test users, see: https://developers.facebook.com/docs/test_users/
  fetchTestUsers = (callback) ->
    url = "https://graph.facebook.com/#{AppConfig.appId}/accounts/test-users?access_token=#{APP_ACCESS_TOKEN}"
    Meteor.http.get url, {timeout: 30000}, (error, result) ->
      json = JSON.parse result.content
      callback json

  addTestUser = (callback) ->
    url = "https://graph.facebook.com/#{AppConfig.appId}/accounts/test-users?"
    urlParams = {
      "installed": "true",
      "name": "Test protestapp User",
      "locale": "en_US",
      "permissions": "create_event,user_events,friends_events",
      "method": "post",
      "access_token": APP_ACCESS_TOKEN
    }
    url += $.param urlParams
    Meteor.http.post url, {timeout: 30000}, (error, result) ->
      json = JSON.parse result.content
      callback json

  addFriendship = (user1, user2, callback) ->
    url1 = "https://graph.facebook.com/#{user1.id}/friends/#{user2.id}?method=post&access_token=#{user1.access_token}"
    url2 = "https://graph.facebook.com/#{user2.id}/friends/#{user1.id}?method=post&access_token=#{user2.access_token}"
    Meteor.http.get url1, {timeout: 30000}, (error, result) ->
      Meteor.http.get url2, {timeout: 30000}, (error, result) ->
        callback()

  addEventOnTestUser = (user, callback) ->
    headers = {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"}
    url = "https://graph.facebook.com/#{user.id}/events"
    params = {
      "name": "Test Protest Event #changebrazil",
      "start_time": eventDt,
      "access_token": user.access_token,
      "location": "Av. Boa Viagem, Recife, Brasil"
    }
    Meteor.http.post url, {headers: headers, params: params, timeout: 30000}, (error, result) ->
      json = JSON.parse result.content
      callback json

  # Testing with mocha.
  # See: http://visionmedia.github.com/mocha/
  # Using Chai expect assertion style.
  # See: http://chaijs.com/api/bdd/
  expect = chai.expect

  describe 'Facebook', ->
    user1 = null
    user2 = null
    eventId = null
    
    @.timeout 5 * 60 * 1000  # 5 minutes suit timeout

    before (done) ->
      throw new Error "Empty access token" unless APP_ACCESS_TOKEN

      addTestUser (json) ->
        user1 = json
        addTestUser (json) ->
          user2 = json
          addFriendship user1, user2, ->
            addEventOnTestUser user2, (json) ->
              eventId = json.id
              done()

    beforeEach ->
      Geolocation.setShowAll(true);
      Facebook.logout()
      
    afterEach ->
      Geolocation.setShowAll(true);
      Facebook.logout()
      
    describe '#login()', ->
      it 'should set accessToken', ->
        Facebook.login user1.access_token
        accessToken = Facebook.getAccessToken()
        expect(accessToken).to.not.be.null
        expect(accessToken).to.be.equal user1.access_token

      it 'should automatically fetch friends events', (done) ->
        Facebook.login user1.access_token

        Meteor.autorun ->
          try
            eventDtAsKey = moment(eventDt, "YYYY-MM-DDThh:mm:ssZZ").format SelectedDate.getKeyFormat()
            fbEventsCursor = Facebook.getEventsByDate(eventDtAsKey)
            if fbEventsCursor.count()
              fbEvents = fbEventsCursor.fetch()
              expect(fbEvents).to.be.an.instanceof Array
              expect(fbEvents).to.have.length 1
              expect(fbEvents[0].id).to.be.equal eventId
              done()
          catch error
            done(error)
