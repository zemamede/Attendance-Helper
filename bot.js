var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
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

var months = {1:"Janeiro", 2:"Fevereiro",3:"Março",4:"Abril",5:"Maio",6:"Junho",7:"Julho",8:"Agosto",9:"Setembro",10:"Outubro",11:"Novembro",12:"Dezembro"};
var dateRegex = /(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/i
var commandRegex = /^\![^\!]+$/
var botChannelID = 0;
var testChannelId = 644516490946543657;

function checkValidDate(day, month, year){
    var date = year+"-"+month+"-"+day+"T21:15:00Z"
    var compareDate = new Date(date).getTime()
    var currentDate = new Date().getTime()
    console.log(currentDate + "<->"+compareDate)
    if( currentDate > compareDate )
        return false;
    return true;
};

function isEmptyOrSpaces(str) {
    return (str === null || (/^ *$/).test(str) !== null);
};

client.on('message', message => {
    if (commandRegex.test(message.content)) {
        try {
            var info = message.content.split(" ");
            var command = info[0].substring(1, info[0].length);
            if (message.channel.id == testChannelId) {
                switch (command) {
                    case 'miss':
                        var values = tryAndParseDate(message, info[1])
                        if (values.success) {
                            message.channel.send(message.author.username + ' vai faltar no dia ' + values.Date[0] + " de " + months[parseInt(values.Date[1])] + " de " + values.Date[2]);
                        }
                        break;
                    case 'come':
                        var values = tryAndParseDate(info[1], message.channel.id, message.author.id)
                        if (values.success) {
                                client.sendMessage({
                                    to: channelId,
                                    message: user + ' mudou de planos e pode vir no dia ' + values.Date[0] + " de " + months[parseInt(values.Date[1])] + " de " + values.Date[2]
                                });
                        }
                        break;
                    case 'avail':
                        var values = tryAndParseDate(info[1], channelId,userId)
                        if (values.success) {
                            client.sendMessage({
                                to: channelId,
                                message: "Há " + 30 + " pessoas disponiveis para dia " + values.Date[0] + " de " + months[parseInt(values.Date[1])] + " de " + values.Date[2]
                            });
                        }
                        break;
                    case 'help':
                        client.sendMessage({
                            to: channelId,
                            message: "Available Commands:\n\n !miss dd/MM/yyyy\n !come dd/MM/yyyy\n !avail dd/MM/yyyy\n\n"
                        });
                        break;
                    default:
                        client.sendMessage({
                            to: channelId,
                            message: "Command not found!"
                        });
                }
            } else {
                client.sendMessage({
                    to: userId,
                    message: "Unauthorized channel to send message"
                });
            }
        } catch (ex) {
            client.sendMessage({
                to: channelId,
                message: ex
            });
        } 
    }  
});

function tryAndParseDate(message, info) {
    try {
        var date = null
        if (dateRegex.test(info)) {
            var date = info.split(/[./-]/)
            if (checkValidDate(date[0], parseInt(date[1]), date[2])) {
                return { success: true, Date: date };
            } else {
                message.author.send("Não queiras voltar atrás no tempo palhaço");
            }
            if(date!=null)
                return date;
        }
        client.sendMessage({
            to: channelId,
            message: "Invalid date!"
        });
        return { success: false }
    } catch (ex) {
        console.log(ex)
    }
};