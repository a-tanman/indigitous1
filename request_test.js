var request = require('request');

export function meetup(hobby) {
  var url = `https://api.meetup.com/2/open_events?and_text=False&country=sg&offset=0&format=json&lon=103.851959&limited_events=False&topic=${hobby}&photo-host=public&page=20&radius=25.0&lat=1.29027&desc=False&status=upcoming&sig_id=182650315&sig=c9e556a9dc938a0d6d06dd6ab9fd060e2e4b8576`
  // console.log(url);
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      var eventName = body.results[0].name;
      var eventLink = body.results[0].event_url;
      var result = [];
      result.push(eventName);
      result.push(eventLink);
      console.log(result);
      return result;
    } else {
      console.log(error);
      return;
    }
  });
}
