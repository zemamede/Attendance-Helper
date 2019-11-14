var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    bot.user = "zor";
    logger.info('Connected');
    logger.info('Logged in as: ' + bot.user);
    logger.info(bot.username + ' - (' + bot.id + ')');
});

var months = {1:"Janeiro", 2:"Fevereiro",3:"Março",4:"Abril",5:"Maio",6:"Junho",7:"Julho",8:"Agosto",9:"Setembro",10:"Outubro",11:"Novembro",12:"Dezembro"};
var dateRegex = /(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/i
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

function tryAndParseDate(info, channelId) {
    try {
        var date = info[1].split("/")
        return date;
    } catch (ex) {
        console.log(ex)
    }
};

function isEmptyOrSpaces(str) {
    return (str === null || (/^ *$/).test(str) !== null);
};


bot.on('message', function (user, userID, channelID, message, evt) {
   
    
    if (message.substring(0, 1) == '!' && isEmptyOrSpaces(command)) {
        try {
            var info = message.split(" ");
            var command = info[0].substring(1, info[0].length);
            if (channelID == testChannelId) {
                var date = tryAndParseDate(info, channelID)
                switch (command) {
                    case 'miss':
                        if (dateRegex.test(info[1])) {
                            if (checkValidDate(date[0], parseInt(date[1]), date[2])) {
                                bot.sendMessage({
                                    to: channelID,
                                    message: user + ' vai faltar no dia ' + date[0] + " de " + months[parseInt(date[1])] + " de " + date[2]
                                });
                            } else {
                                bot.sendMessage({
                                    to: userID,
                                    message: "Não queiras voltar atrás no tempo palhaço"
                                });
                            }
                        } else {
                            bot.sendMessage({
                                to: channelID,
                                message: "Invalid date!"
                            });
                        }
                        break;
                    case 'come':
                        if (dateRegex.test(info[1])) {
                            if (checkValidDate(day, parseInt(date[1]), year)) {
                                bot.sendMessage({
                                    to: channelID,
                                    message: user + ' mudou de planos e pode vir no dia ' + date[0] + " de " + months[parseInt(date[1])] + " de " + date[2]
                                });
                            } else {
                                bot.sendMessage({
                                    to: userID,
                                    message: "Não queiras voltar atrás no tempo palhaço"
                                });
                            }
                        } else {
                            bot.sendMessage({
                                to: channelID,
                                message: "Invalid date!"
                            });
                        }
                        break;
                    case 'avail':
                        if (dateRegex.test(info[1])) {
                            bot.sendMessage({
                                to: channelID,
                                message: "Há " + 30 + " pessoas disponiveis para dia " + date[0] + " de " + months[parseInt(date[1])] + " de " + date[2]
                            });
                        } else {
                            bot.sendMessage({
                                to: channelID,
                                message: "Invalid date!"
                            });
                        }
                        break;
                    case 'help':
                        bot.sendMessage({
                            to: channelID,
                            message: "Type !miss !come !avail followed by {dd/MM/yyyy}"
                        });
                        break;
                    default:
                        bot.sendMessage({
                            to: channelID,
                            message: "Command not found!"

                        });
                }
            } else {
                bot.sendMessage({
                    to: channelID,
                    message: "Unauthorized channel to send message"
                });
            }
        } catch(ex) {
            bot.sendMessage({
                to: channelID,
                message: ex
            });
        } 
    }  
});