var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
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

client.on('ready', () => {
    console.log('Client has been started');
});

client.login(auth.token);

var commandRegex = /^\![^\!]+$/
var botChannelID = 0;
var testChannelId = 644516490946543657;

client.on('message', message => {
    if (commandRegex.test(message.content)) {
        try {
            var info = message.content.split(" ");
            var command = info[0].substring(1, info[0].length);
            if (message.channel.id == testChannelId) {
                message.channel.send(consumer.RunCommand(command, message, info));
            } else {
                message.channel.send("Unauthorized channel to send message!");
            }
        } catch (ex) {
            message.channel.send(ex);
        } 
    }  
});
