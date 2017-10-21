/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
//const bot = require('./bot.js');

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

bot.dialog('/start', function(session){
    session.send('Hello there!');
}).triggerAction({ matches:/^(Get\sStarted)/i });

bot.use(builder.Middleware.sendTyping());

const logUserConversation = (event) => {
    //console.log('test log ' + event.text);
    if(isEmpty(event.text)){
    console.log('\ntimestamp: ' + getDateTime() + '; message: ' + event.text + '; user: ' + event.address.user.name + '; id: ' + event.address.user.id);
    fs.appendFile('log.txt', '\ntimestamp: ' + getDateTime() + '; message: ' + event.text + '; user: ' + event.address.user.name, function(err) {
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

