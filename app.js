/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/
var fs = require('fs');
var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
//const bot = require('./bot.js');

var resource_id = '1338652566261532';
var troubled_id = '1702892436422920';
var reroute_resource = false;
var reroute_troubled = false;


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    stateEndpoint: process.env.BotStateEndpoint,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
var triggers = 0;

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
// Removing LUIS
// var recognizer = new builder.LuisRecognizer(LuisModelUrl);
// var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
//.onDefault((session) => {
//    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
//});

var intents = new builder.IntentDialog();
bot.dialog('/', intents); 
intents.onDefault('/start');

bot.dialog('/start', [
    function(session){
        builder.Prompts.text(session, 'hey there!');
    },
    function(session, results){
    //session.send('hey there');
    session.beginDialog('/sad');
    }]).triggerAction({ matches:/^(Get\sStarted|hi|hello)/i });

bot.dialog('/sad',[
        function(session){
            session.send(':(');
            builder.Prompts.text(session, 'Why are you sad?');
        },
        function(session, results){
            session.send('I understand...');
            session.send('I\'ve got no friends too.');
            builder.Prompts.text(session, 'I can be your friend =)');
        },
        function(session, results){
            builder.Prompts.text(session, 'How can i help you?');
        }, 
        function(session, results){
            session.send('I\'m sorry to hear that, you must feel awful.');
            session.send('Do you want to share how you feel?');
            let options = {
                listStyle: builder.ListStyle['button']
            };
            builder.Prompts.choice(session, "Have you completed your bucket list? Check out www.bucketlist.org", ['Yes','No'], options);
        }, 
        function(session, results){
            if(results.response){
                switch (results.response.index){
                    case 0:
                        session.send('Cool! Check out my bucket list at https://bucketlist.org/list/TyTy/');
                        break;
                    case 1:
                        builder.Prompts.text(session,'Oh no. Why not?');
                        break;
                }
            }
        },
        function(session, results){
            let options = {
                listStyle: builder.ListStyle['button']
            }
            builder.Prompts.text(session,'That\'s a big decision. Do you want to meet and talk about it over drinks? I\'m at 33 Smith Street.');
            //builder.Prompts.choice(session, 'That\s a big decision. Do you want to meet and talk about it over drinks? I\'m at 33 Smith Street.', ['Yes','No'], options);
        },
//        function(session, results){
//                if(results.response){
//                    switch (results.response.index){
//                        case 0:
//                            //session.send('How long will you take to get there?');
//                            builder.Prompts.text(session, 'How long will you take to get there?');
//                            break;
//                        case 1:
//                                //builder.Prompts.text(session, ':(');
//                                session.send('Ouch, that is going to be painful!');
//                                session.send('There is no real best way to die and they all involve a lot of pain.');
//                                session.send('Hang on, let me think about it...');
//                                session.beginDialog('route');
//                            break;
//                    }
//                }
//        },
        function(session, results){
                if(results.response){
                    session.send(':\'( Ouch, that is going to be painful!');
                    session.send('There is no real best way to kill yourself without involving a lot of pain.');
                   session.send('Hang on, let me think about it...'); 
                    session.beginDialog('route');
                    console.log(results.response);
                }
        }

]).triggerAction({ matches:/^(I\sam\sSad)/i});

bot.dialog('route', [
        function(session){
console.log('Test reroute');
reroute_troubled = true;
    request({
  uri: "https://graph.facebook.com/v2.6/me/messages?access_token=EAACWwd1mk3gBANPeqrVtCbynXs7rIIUVIKsY8OZCnnWEZBueGOsgt5kZBdjOHdJtFfF5Dot8RL628jmOeGikW8OEZCWPp8d1ZAWp3P7IRSFZAN0G0VKsXAh7Vv33OYYRWm3WKLYjkd1RupHxXuk4aZAsZA6L9MdFCjfrosSzIlCcngZDZD",
  method: "POST",
  json: {
      recipient: { "id" : resource_id },
      message: { "text" : "Help! We have someone who urgently needs to talk to you. Suicidal risk is: High. Type 'GO' to be connected now..."}
  }
})
    session.beginDialog('needhelp');
    }    ]).triggerAction({ matches:/^(reroute)/i});

bot.dialog('needhelp',[
        function(session){
                builder.Prompts.text(session, '>');
        },
        function(session, results){
                
            if(results.response){
               request({
  uri: "https://graph.facebook.com/v2.6/me/messages?access_token=EAACWwd1mk3gBANPeqrVtCbynXs7rIIUVIKsY8OZCnnWEZBueGOsgt5kZBdjOHdJtFfF5Dot8RL628jmOeGikW8OEZCWPp8d1ZAWp3P7IRSFZAN0G0VKsXAh7Vv33OYYRWm3WKLYjkd1RupHxXuk4aZAsZA6L9MdFCjfrosSzIlCcngZDZD",
  method: "POST",
  json: {
      recipient: { "id" : resource_id },
      message: { "text" : results.response}
  }
            })
        first_go = false;
        session.beginDialog('needhelp');
        }

            //console.log('empty prompts test');
        }]);


bot.use(builder.Middleware.sendTyping());

var first_go = true;
bot.dialog('go',[
        function(session){
            if(first_go){
                builder.Prompts.text(session,'Your conversation is starting now...');
            } else {
                builder.Prompts.text(session, '>');
            }
        },
        function(session, results){
            console.log(results.response);
            if(results.response){
               request({
  uri: "https://graph.facebook.com/v2.6/me/messages?access_token=EAACWwd1mk3gBANPeqrVtCbynXs7rIIUVIKsY8OZCnnWEZBueGOsgt5kZBdjOHdJtFfF5Dot8RL628jmOeGikW8OEZCWPp8d1ZAWp3P7IRSFZAN0G0VKsXAh7Vv33OYYRWm3WKLYjkd1RupHxXuk4aZAsZA6L9MdFCjfrosSzIlCcngZDZD",
  method: "POST",
  json: {
      recipient: { "id" : troubled_id },
      message: { "text" : results.response}
  }
            })
        first_go = false;
        session.beginDialog('go');
        }
    }
]).triggerAction({ matches:/^(go)/i});

const logUserConversation = (event) => {
    //console.log('test log ' + event.text);
    if(isEmpty(event.text)){
    console.log('\ntimestamp: ' + getDateTime() + '; message: ' + event.text + '; user: ' + event.address.user.name + '; id: ' + event.address.user.id);
    fs.appendFile('log.txt', '\ntimestamp: ' + getDateTime() + '; message: ' + event.text + '; user: ' + event.address.user.name + '; id: ' + event.address.user.id, function(err) {
        if (err) {
            // append failed
            console.log('append failed')
        } else {
            // done
        }
    });
}
    //console.log('message: ' + event.text + ', user: ' + event.address.user.name);
};

// Middleware for logging
bot.use({
    receive: function(event, next) {
        logUserConversation(event);
        next();
    },
    send: function(event, next) {
        logUserConversation(event);
        next();
    }
});

function getDateTime() {
    var utc = new Date().toJSON();
    return(utc);
}

function isEmpty(object) { for(var i in object) { return true; } return false; }

