// JavaScript source code
var Discord = require('discord.js');

const helpEmbeddedMessage = new Discord.RichEmbed()
    .setColor('#0099ff')
    .setTitle('SN Attendance helper')
    .setDescription('User guide')
    .addField('Commands', '!miss - Announce when you are not available\n!come - Replace your missing status back to attending\n!avail - Number of people availabe', true)
    .addField('Examples', '!miss dd/mm/yyyy\n!come dd/mm/yyyy\n!avail dd/mm/yyyy');

const months = { 1: "Janeiro", 2: "Fevereiro", 3: "Mar�o", 4: "Abril", 5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto", 9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro" };
const dateRegex = /(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/i

class Consumer {

    checkValidDate(day, month, year) {
        var date = year + "-" + month + "-" + day + "T21:15:00Z"
        var compareDate = new Date(date).getTime()
        var currentDate = new Date().getTime()
        if (currentDate > compareDate)
            return false;
        return true;
    }

    isDateRangeValid(dayA, monthA, yearA, dayB, monthB, yearB) {
        var dateA = yearA + "-" + monthA + "-" + dayA
        var dateB = yearB + "-" + monthB + "-" + dayB
        if (dateA < dateB)
            return true;
        return false;
    }

    numberOfDaysBetweenDates(dateA, dateB) {
        return Math.round((dateB - dateA) / (1000 * 60 * 60 * 24))
    }

    tryAndParseDate(message, info) {
        try {
            var date = null
            var rangeDate = info.split(":");
            if (rangeDate.length > 1) {
                if (dateRegex.test(rangeDate[0]) && dateRegex.test(rangeDate[1])) {
                    var dateA = rangeDate[0].split(/[./-]/);
                    var dateB = rangeDate[1].split(/[./-]/);
                    if (this.checkValidDate(dateA[0], dateA[1], dateA[2]) && this.isDateRangeValid(dateA[0], dateA[1], dateA[2], dateB[0], dateB[1], dateB[2])) {
                        return { rangeSuccess: true, startDate: dateA, endDate: dateB };
                    } else {
                        message.author.send("N�o queiras voltar atr�s no tempo :smile:");
                    }
                    return { rangeSuccess: false }
                }
                message.channel.send("Invalid date range!")
                return { rangeSuccess: false }
            } else {
                if (dateRegex.test(info)) {
                    var date = info.split(/[./-]/)
                    if (this.checkValidDate(date[0], parseInt(date[1]), date[2])) {
                        return { success: true, Date: date };
                    } else {
                        message.author.send("N�o queiras voltar atr�s no tempo :smile:");
                    }
                    if (date != null)
                        return date;
                }
                message.channel.send("Invalid date!")
                return { success: false }
            }
        } catch (ex) {
            console.log(ex)
        }
    }

    RunCommand(command, message, info) { 
        var response = null;
        switch (command) {
            case 'miss':
                var values = this.tryAndParseDate(message, info[1])
                if (values.success) {
                    response = message.author.username + ' vai faltar no dia ' + values.Date[0] + " de " + months[parseInt(values.Date[1])] + " de " + values.Date[2];
                }
                else if (values.rangeSuccess) {
                    response = message.author.username + ' vai faltar do dia ' + values.startDate[0] + ' de '
                        + months[parseInt(values.startDate[1])] + " de " + values.startDate[2] + " at� "
                        + values.endDate[0] + ' de ' + months[parseInt(values.endDate[1])] + " de " + values.endDate[2];
                }
                break;
            case 'come':
                var values = this.tryAndParseDate(message, info[1])
                if (values.success) {
                    response = message.author.username + ' mudou de planos e pode vir no dia ' + values.Date[0] + " de " + months[parseInt(values.Date[1])] + " de " + values.Date[2];
                }
                break;
            case 'avail':
                var values = this.tryAndParseDate(message, info[1])
                if (values.success) {
                    response = "H� " + 30 + " pessoas disponiveis para dia " + values.Date[0] + " de " + months[parseInt(values.Date[1])] + " de " + values.Date[2];
                }
                break;
            case 'help':
                response = helpEmbeddedMessage;
                break;
            default:
                response = "Command not found!";
        }
        return JSON.parse(JSON.stringify(response));
    }

    
};

module.exports = Consumer;