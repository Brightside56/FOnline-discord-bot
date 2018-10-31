const Discord = require("discord.js");
const fs = require("fs");
const moment = require('moment');
const request = require("request");
const bot = new Discord.Client({autoReconnect: true, max_message_cache: 0});
var rn = require('random-number');

var options = {
    min: 1, max: 1000, integer: true
}


var srvstatus;

const config = require('../config.json');
const events = require('./assets/events.json');

const dm_text = "Hey there! Use !commands on any FOnline 2 server chat room to see the command list.";
const usebotchanneltext = "Using of this command is allowed only in bot channel";
const mention_text = "Use !commands to see the command list.";


const util = require('util');
const requestasync = require('request-promise');


const dbhost = config.dbhost;
const dbuser = config.dbuser;
const dbpass = config.dbpass;
const dbname = config.dbname;
const tblname = config.tblname;
const eventsurl = config.eventsurl;
const simurl = config.simurl;


let stopped = false;
let inform_np = true;

let buff = new Buffer([0xFF, 0xFF, 0xFF, 0xFF]);
let net = require('net');
let Math = require('math');
let buffer = new Buffer('', 'hex');

let online = '';
let uptime = '';

let botToken = config.botToken;
let serverName = config.serverName;
let roles = config.authorizedRoles;
let nsfwrole = config.nsfwRole;
let applyadminid = config.applyadminid;
let applychannelid = config.applychannelid;
let botchannelids = config.botchannelids;

//
let commands = [

    {
        command: "commands",
        description: "Displays this message, duh!",
        parameters: [],
        anywhere: 0,
        permissions: 0,
        execute: function (message, params) {
            var response = "Available commands:";

            for (var i = 0; i < commands.length; i++) {
                var c = commands[i];
                if (c.permissions == 0) {
                    response += "\n!" + c.command;

                    for (var j = 0; j < c.parameters.length; j++) {
                        response += " <" + c.parameters[j] + ">";
                    }

                    response += ": " + c.description;
                }
            }

            message.reply(response);
        }
    },

    {
        command: "whenwipe",
        description: "Bot will answer when wipe",
        parameters: [],
        anywhere: 0,
        permissions: 0,
        execute: function (message, params) {
            message.reply("Soon!");
        }
    },

    {
        command: "sim",
        description: "Bot will print simulation status",
        parameters: [],
        anywhere: 0,
        permissions: 0,
        execute: function (message, params) {


            requestasync({
                "method": "GET",
                "uri": simurl,
                "json": true,
                "headers": {
                    "User-Agent": "FOnline 2 Discord Bot"
                }
            })
                .then(context => {
                    poller.sim(context, message.channel.id);
                })
                .catch(function (err) {
                    console.log("some error with request FOnline URL");
                    poller.sim("", message.channel.id);
                });

        }
    },


    {
        command: "changename",
        description: "Bot will change nickname",
        parameters: [],
        anywhere: 0,
        permissions: 1,
        execute: function (message, params) {
            let nickname = message.content.substr("!changename ".length);
            message.guild.members.get(bot.user.id).setNickname(nickname);
        }
    },

    {
        command: "changeavatar",
        description: "Bot will change avatar",
        parameters: ["avatarurl"],
        anywhere: 0,
        permissions: 1,
        execute: function (message, params) {
            bot.user.setAvatar(params[1]);
        }
    },

    {
        command: "joke",
        description: "Bot will print random joke",
        parameters: [],
        anywhere: 0,
        permissions: 0,
        execute: function (message, params) {
            var jokes = get_items_from_file("./assets/jokes.txt");
            message.channel.send(jokes[Math.floor(Math.random() * jokes.length)])
        }
    },

    {
        command: "eightball",
        description: "Bot will print eightball answer",
        parameters: [],
        anywhere: 0,
        permissions: 0,
        execute: function (message, params) {
            var eightball = get_items_from_file("./assets/8ball.txt");
            message.channel.send(":8ball: " + eightball[Math.floor(Math.random() * eightball.length)])
        }
    },

    {
        command: "tip",
        description: "Bot will print random tip",
        parameters: [],
        anywhere: 0,
        permissions: 0,
        execute: function (message, params) {
            var tips = get_items_from_file("./assets/tips.txt");
            message.channel.send(tips[Math.floor(Math.random() * tips.length)])
        }
    },

    {
        command: "apply",
        description: "A command for sending an application to join Fonline2 Discord contributor section.",
        parameters: "",
        message: 1,
        anywhere: 1,
        permissions: 0,
        execute: function (message, params) {
            bot.channels.get(applychannelid).send("<@!" + applyadminid + ">, You have new application")
            bot.channels.get(applychannelid).send(
                {
                    "embed": {
                        "description": "```" + params + "```",
                        "timestamp": new Date(),
                        "color": 110930,
                        "author": {
                            "name": message.author.tag,
                            "icon_url": message.author.avatarURL
                        }
                    }
                })
            message.author.send("Your application was sent");
            message.delete();
        }
    },


    {
        command: "prune",
        description: "Deletes number of messages you want to delete",
        parameters: ["Count of messages"],
        anywhere: 1,
        permissions: 1,
        execute: function (message, params) {
            let messagecount = parseInt(params[1]);
            if (messagecount > 0 && messagecount < 100) {
                message.channel.fetchMessages({limit: (messagecount + 1)}).then(messages => {
                    message.channel.bulkDelete(messages);
                    messagesDeleted = messages.array().length;
                    message.channel.send("Clearing the area! " + (messagesDeleted - 1) + " messages deleted.");
                })
                    .catch(err => {
                        console.log('Error while doing Bulk Delete');
                        console.log(err);
                    });
            }
            else {
                message.channel.fetchMessages({limit: (100)}).then(messages => {
                    message.channel.bulkDelete(messages);
                    messagesDeleted = messages.array().length;
                    message.channel.send("Clearing the area! " + (messagesDeleted) + " messages deleted.");
                })
                    .catch(err => {
                        console.log('Error while doing Bulk Delete');
                        console.log(err);
                    });
            }
        }
    },

    {
        command: "nsfwtalk",
        description: "Let you use nsfw-freetalk channel",
        parameters: [],
        anywhere: 1,
        permissions: 0,
        execute: function (message, params) {
            if (!message.member.roles.find("name", nsfwrole)) {
                let role = message.guild.roles.find("name", nsfwrole);
                message.member.addRole(role);
                var nsfw_msg = fs.readFileSync("/src/assets/nsfw_rules.txt", {"encoding": "utf-8"});
                message.author.send(nsfw_msg);
            }
            message.delete();
        }
    },


    {
        command: "status",
        description: "Bot will check and reply server status",
        parameters: [],
        anywhere: 0,
        permissions: 0,
        execute: function (message, params) {
            let serverstatus;
            let msg;
            var client = new net.Socket();
            client.setTimeout(1000);
            client.connect(config.serverport, config.serverhost, function () {
                console.log('Connected 1');
                client.write(buff);
            });
            client.on('data', function (data) {
                console.log('Received: ' + data);
                var buffer = new Buffer('', 'hex');
                buffer = Buffer.concat([buffer, new Buffer(data, 'hex')]);
                online = buffer.readUInt32LE(0);
                uptime = buffer.readUInt32LE(4);
                console.log(online);
                if (online != '') {
                    var uptimems = Math.round(uptime * 1000);
                    var datetimenow = Date.now();
                    var uptimets = Math.round(datetimenow - uptimems);
                    moment.locale('en');
                    var day = moment(uptimets).toNow(true);
                    msg = "Server status: online.\r\nPlayers online: " + online + "\r\n" + day + " since last restart";
                    serverstatus = 1;
                }
                else {
                    serverstatus = 0;
                }
                client.destroy();
            });
            client.on('error', function (err) {
                serverstatus = 0;
                client.destroy();
            });
            client.on('timeout', function (err) {
                serverstatus = 0;
                client.destroy();
            });

            client.on('close', function (){
                if (serverstatus == 0) {
                    message.reply("Server status: offline!");
                } else
                {
                    message.reply(msg);
                }
            });

        }
    }


];


///////////////////////////////////////////////////

bot.on("disconnect", event => {
    console.log("Disconnected: " + event.reason + " (" + event.code + ")");
});

bot.on("message", message => {

    if (message.channel.type == "dm" && message.author.id !== bot.user.id) {
        message.author.send(dm_text);
    } else {
        if (message.isMentioned(bot.user)) {
            message.reply(mention_text);
        } else {
            var message_text = message.content;
            if (message_text[0] == '!') { //Command issued
                handle_command(message, message_text.substring(1));
            }
        }
    }
});


////////////////////////////////////////////////////


function get_items_from_file(filename) {

    var array = fs.readFileSync(filename).toString().split("\n");
    return array;
}


function search_command(text) {
    for (var i = 0; i < commands.length; i++) {
        let lowtext = text.toLowerCase();
        if (commands[i].command == lowtext.substring(0, commands[i].command.length)) {
            return commands[i];
        }
    }

    return false;
}

function handle_command(message, text) {
    var params = text.split(" ");
    var command = search_command(text);
    if (command.message > 0) {
        params = text.replace(command.command + " ", "");
    }
    if (command) {
        if (message.channel.type !== "dm" && message.author.id !== bot.user.id) {
            if (botchannelids.includes(message.channel.id) || command.anywhere == 1) {
                if (command.permissions > 0 && message.member.roles.some(r => roles.includes(r.name))) {
                    if (params.length - 1 < command.parameters.length) {
                        message.reply("Insufficient parameters!");
                    } else {
                        command.execute(message, params);
                    }
                } else if (command.permissions > 0) {
                    message.reply("Insufficient permissions!");
                } else {
                    if (params.length - 1 < command.parameters.length) {
                        message.reply("Insufficient parameters!");
                    } else {
                        command.execute(message, params);
                    }
                }
            } else {
                message.author.send(usebotchanneltext);
                message.delete();
            }
        }
    }
}


function get_server_status() {
    let serverstatus;
    var client = new net.Socket();
    client.setTimeout(1000);
    client.connect(config.serverport, config.serverhost, function () {
        console.log('Connected 1');
        client.write(buff);
    });
    client.on('data', function (data) {
        console.log('Received: ' + data);
        var buffer = new Buffer('', 'hex');
        buffer = Buffer.concat([buffer, new Buffer(data, 'hex')]);
        online = buffer.readUInt32LE(0);
        uptime = buffer.readUInt32LE(4);
        console.log(online);
        if (online != '') {
            var uptimems = Math.round(uptime * 1000);
            var datetimenow = Date.now();
            var uptimets = Math.round(datetimenow - uptimems);
            moment.locale('en');
            var day = moment(uptimets).toNow(true);
            serverstatus = 1;
        }
        else {
            serverstatus = 0;
        }
        client.destroy();
    });
    client.on('error', function (err) {
        serverstatus = 0;
        client.destroy();
    });
    client.on('timeout', function (err) {
        serverstatus = 0;
        client.destroy();
    });

    client.on('close', function (){
        srvstatus = serverstatus;
    });

}


module.exports.sendevent = function (event) {
    console.log(events[event.name].logic);
    if (events[event.name].logic === "Announce") {
        var message = util.format(events[event.name].title, "15");
    }
    console.log(events[event.name]);
}

module.exports.sendsim = function (sim) {
    let status = "";
    let text = "";
    let activity = "";
    if (srvstatus === 0) {
        status = "dnd";
        activity = "watching";
        text = "server down!";
        bot.user.setPresence({game: {name: text, type: activity}, status: status});
    } else {
        if (sim > 0) {
            status = "online";
            activity = "watching";
            text = "simulation, players - " + sim;
            //channel.send("Simulation is on, players - " + sim);
            //console.log("Simulation is on, players - " + sim);
            bot.user.setPresence({game: {name: text, type: activity}, status: status});
        } else {
            status = "idle";
            activity = "listening";
            text = "!commands";
            //channel.send("There is no simulation battles at the moment");
            //console.log("There is no simulation at the moment");
            bot.user.setPresence({game: {name: text, type: activity}, status: status});
        }
    }
}


module.exports.answersim = function (sim, channel) {
    let text = "";
    if (srvstatus === 0) {
        text = "There is no simulation at the moment";
        bot.channels.get(channel).send(text);
    } else {
        if (sim > 0) {
            text = "Simulation is on, players - " + sim;
            console.log(channel);
            bot.channels.get(channel).send(text);
        } else {
            text = "There is no simulation at the moment";
            console.log(channel);
            bot.channels.get(channel).send(text);
        }
    }
}


var poller = require('./poller.js');

bot.run = function (server_name, token) {

    bot.on("ready", () => {
        var server = bot.guilds.find("name", server_name);
        if (server === null) throw "Couldn't find server '" + server_name + "'";
        bot.user.setActivity('... loading ...');
        bot.user.setPresence({ game: { name: '... loading ... ', type: 'watching'}, status: 'idle' });
        console.log("Connected!");
    });

    bot.login(token);


    setInterval(function () {


        requestasync({
            "method": "GET",
            "uri": eventsurl,
            "json": true,
            "headers": {
                "User-Agent": "FOnline 2 Discord Bot"
            }
        })
            .then(context => {
                poller.events(context, dbhost, dbuser, dbpass, dbname, tblname);
            })
            .catch(function (err) {
                console.log("some error with request FOnline URL");
                poller.events("", dbhost, dbuser, dbpass, dbname, tblname);
            });
    }, 10000);


    setInterval(function () {


        requestasync({
            "method": "GET",
            "uri": simurl,
            "json": true,
            "headers": {
                "User-Agent": "FOnline 2 Discord Bot"
            }
        })
            .then(context => {
                poller.sim(context);
            })
            .catch(function (err) {
                console.log("some error with request FOnline URL");
                poller.sim("");
            });

    }, 30000);


    setInterval(function () {

    get_server_status();
    }, 5000);


}

bot.run(serverName, botToken);