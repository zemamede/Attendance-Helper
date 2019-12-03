// JavaScript source code
var Discord = require('discord.js');
var DataAccessLayer = require('./authentication.js');
const dictionary = require('./Dictionary.json');
const Dal = new DataAccessLayer();

const helpEmbeddedMessage = new Discord.RichEmbed()
    .setColor('#0099ff')
    .setTitle('SN Attendance helper')
    .setDescription('User guide')
    .addField('Commands', '!miss - Announce when you are not available\n!come - Replace your missing status back to attending\n!avail - Number of people availabe\n!attend - Percentage of presences in a specific month', true)
    .addField('Examples', '!miss dd/mm/yyyy\n!come dd/mm/yyyy\n!avail dd/mm/yyyy\n!attend mm/yyyy');

const dateRegex = /(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/i

const specialDateRegex = /^(0?[1-9]|10|11|12)(\/|\.|\-)20[0-9][0-9]$/i

class Consumer {
    checkValidDate(day, month, year) {
        var date = year + "-" + month + "-" + day;
        var requestDate = new Date(date);
        requestDate.setHours(22);
        var compareDate = requestDate.toISOString()
        var currentDate = new Date().toISOString()
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

    tryAndParseDate(info) {
        try {
            var errorMessage = null;
            var date = null
            if (info != null) {
                if (info.includes(":")) {
                    var rangeDate = info.split(":");
                    if (dateRegex.test(rangeDate[0]) && dateRegex.test(rangeDate[1])) {
                        var dateA = rangeDate[0].split(/[./-]/);
                        var dateB = rangeDate[1].split(/[./-]/);
                        if (this.checkValidDate(dateA[0], dateA[1], dateA[2]) && this.checkValidDate(dateB[0], dateB[1], dateB[2])) {
                            if (this.isDateRangeValid(dateA[0], dateA[1], dateA[2], dateB[0], dateB[1], dateB[2])) {
                                return { rangeSuccess: true, startDate: dateA, endDate: dateB };
                            } else {
                                errorMessage = "Invalid date range!";
                            }
                        } else {
                            errorMessage = "Input dates are invalid";
                        }
                    }
                } else {
                    if (dateRegex.test(info)) {
                        var date = info.split(/[./-]/)
                        if (this.checkValidDate(date[0], parseInt(date[1]), date[2])) {
                            return { success: true, Date: date };
                        } else {
                            errorMessage = "Input date was set to the past <:AutisticPEPE:304280834574123008>";
                        }
                    } else {
                        errorMessage = "Invalid date!";
                    }
                }
            }
            if (errorMessage == null)
                errorMessage = "Missing date OR date range!";
            return { success: false, rangeSuccess: false, message: errorMessage }
        } catch (ex) {
            console.log(ex);
        } 
    }

    tryAndParseSpecialDate(info) {
        try {
            var errorMessage = null;
            var date = null
            if (info != null) {
                if (specialDateRegex.test(info)) {
                    var date = info.split(/[./-]/)
                    return { success: true, Date: date };
                } else {
                    errorMessage = "Invalid Month/Year combination!";
                }  
            }
            if (errorMessage === null)
                errorMessage = "Missing date!";
            return { success: false, rangeSuccess: false, message: errorMessage }
        } catch (ex) {
            console.log(ex)
        }
    }

    sendChatMessage(message, response) {
        var chatMessage = null;
        if (response == null)
            chatMessage = "<@" + message.author.id + "> " + response;
        chatMessage = ((typeof response) == (typeof new Discord.RichEmbed())) ? response : "<@" + message.author.id + "> " + response;

        message.channel.send(chatMessage);
    }

    RunCommand(command, message, info) { 
        var response = null;
        var values = null;
        switch (command) {
            case 'miss':
                values = this.tryAndParseDate(info[1])
                if (values.success) {
                    try {
                        Dal.checkAvilability(values, dictionary.Raiders["Total"], dictionary.Days)
                                .then((result) => {
                                    var num = result.data.values[0][0];
                                    console.log('promise success:', num);
                                    if(num != 0){
                                        Dal.updateAttendance("✖", values, dictionary.Raiders[message.author.tag], dictionary.Days);
                                        response = ' vai faltar no dia ' + values.Date[0] + " de " + dictionary.Months[values.Date[1]] + " de " + values.Date[2];
                                    }
                                    else{
                                        response = "Não existe raid no dia " + values.Date[0] + " de " + dictionary.Months[values.Date[1]] + " de " + values.Date[2];
                                    }
                                    })
                                .catch((error) => {
                                    response = "Spreadsheet inválida"
                                    console.log('promise error:', error);
                                })
                                .finally(() => {
                                    console.log('Sending chat message');
                                    this.sendChatMessage(message, response);
                                });;  
                        }
                        catch (ex) {
                            console.log(ex);
                        }   
                }
                else if (values.rangeSuccess) {
                    response = "Nao implementado para a spreadsheet!!!\n" + message.author.username + ' vai faltar do dia ' + values.startDate[0] + ' de '
                        + dictionary.Months[values.startDate[1]] + " de " + values.startDate[2] + " até "
                        + values.endDate[0] + ' de ' + dictionary.Months[values.endDate[1]] + " de " + values.endDate[2];
                    this.sendChatMessage(message, response);
                }
                break;
            case 'come':
                values = this.tryAndParseDate(info[1])
                if (values.success) {
                    try {
                        Dal.checkAvilability(values, dictionary.Raiders["Total"], dictionary.Days)
                                .then((result) => {
                                    var num = result.data.values[0][0];
                                    console.log('promise success:', num);
                                    if(num != 0){
                                        Dal.updateAttendance("✔", values, dictionary.Raiders[message.author.tag], dictionary.Days);
                                        response = message.author.username + ' mudou de planos e pode vir no dia ' + values.Date[0] + " de " + dictionary.Months[values.Date[1]] + " de " + values.Date[2];
                                    }
                                    else{
                                        response = "Não existe raid no dia " + values.Date[0] + " de " + dictionary.Months[values.Date[1]] + " de " + values.Date[2];
                                    }
                                    })
                                .catch((error) => {
                                    response = "Spreadsheet inválida"
                                    console.log('promise error:', error);
                                })
                                .finally(() => {
                                    console.log('Sending chat message');
                                    this.sendChatMessage(message, response);
                                });;  
                        }
                        catch (ex) {
                            console.log(ex);
                        }   
                }
                break;
            case 'avail':
                values = this.tryAndParseDate(info[1])
                if (values.success) {
                    try {
                        Dal.checkAvilability(values, dictionary.Raiders["Total"], dictionary.Days)
                            .then((result) => {
                                var num = result.data.values[0][0];
                                console.log('promise success:', num);
                                response = num > 0 ? "Há " + num + " pessoas disponiveis para dia " + values.Date[0] + " de " + dictionary.Months[values.Date[1]] + " de " + values.Date[2] : "Não existe raid no dia " + values.Date[0] + " de " + dictionary.Months[values.Date[1]] + " de " + values.Date[2];;
                                })
                            .catch((error) => {
                                response = "Spreadsheet inválida";
                                console.log('promise error:', error);
                            })
                            .finally(() => {
                                console.log('Sending chat message');
                                this.sendChatMessage(message, response);
                            });;  
                    }
                    catch (ex) {
                        console.log(ex);
                    }        
                }
                break;
            case 'attend':
                values = this.tryAndParseSpecialDate(info[1]);
                if (values.success) {
                    try {
                        Dal.checkAttendance(values, dictionary.Raiders[message.author.tag])
                            .then((result) => {
                                var num = result.data.values[0][0];
                                console.log('promise success:', num);
                                response = "Tens " + num + "% de attendance em " + dictionary.Months[values.Date[0]] + " de " + values.Date[1];
                            })
                            .catch((error) => {
                                response = "Spreadsheet inválida";
                                console.log('promise error:', error);
                            })
                            .finally(() => {
                                console.log('Sending chat message');
                                this.sendChatMessage(message, response);
                            });;
                    }
                    catch (ex) {
                        console.log(ex);
                    }
                }
                break;
            case 'help':
                response = helpEmbeddedMessage;
                this.sendChatMessage(message, response);
                break;
            /*
            case 'create':
                values = this.tryAndParseSpecialDate(info[1]);
                
                if(values.success){
                    const defaultId = 1125218752;
                    try{
                        Dal.createMonth(values,defaultId);
                        response = "Sheet criada com sucesso para " + dictionary.Months[values.Date[1]] + " de " + values.Date[2];         
                        this.sendChatMessage(message, response);
                    }
                    catch(ex){
                        response = "Erro a criar sheet para " + dictionary.Months[values.Date[1]] + " de " + values.Date[2];  
                        this.sendChatMessage(message, response);
                        console.log(ex);
                    }
                }
               
               break;
            */
            default:
                response = "Command not found!";
                this.sendChatMessage(message, response);
       }
       if (response == null && values.message != null)
           this.sendChatMessage(message, values.message);
    }
};

module.exports = Consumer;  