var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
const authentication = require('./authentication.js');
const Consumer = require("./Consumer.js");
const consumer = new Consumer();

//const consumer = Consumer.ru();
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var client = new Discord.Client();
var OAuthClient = { sheets: null, oAuth2Client: null};

client.on('ready', () => {
    console.log('Client has been started');
});

client.login(auth.token);

var commandRegex = /^\![^\!]+$/
var botChannelId = 510017439510036480;
var debugChannelId = 649698438736248842;

client.on('message', message => {
    if (commandRegex.test(message.content)) {
        try {
            var info = message.content.split(" ");
            var command = info[0].substring(1, info[0].length);
            if (message.channel.id == botChannelId || message.channel.id == debugChannelId) {
                consumer.RunCommand(command, message, info, OAuthClient);
            } else {
                message.channel.send("Unauthorized channel to send message!");
            }
            //message.delete();
        } catch (ex) {
            message.delete();
            message.channel.send(ex);
        } 
    }  
});