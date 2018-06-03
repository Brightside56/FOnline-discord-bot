const Discord = require("discord.js");
const fs = require("fs");
const moment = require('moment');
const request = require("request");

const bot = new Discord.Client({autoReconnect: true, max_message_cache: 0});

var config = require('./config.json');

const dm_text = "Hey there! Use !commands on any FOnline 2 server chat room to see the command list.";
const mention_text = "Use !commands to see the command list.";

var stopped = false;
var inform_np = true;

var buff = new Buffer([0xFF, 0xFF, 0xFF, 0xFF]);
var net = require('net');
var Math = require('math');
var buffer = new Buffer('', 'hex');

var online = '';
var uptime = '';

var botToken = config.botToken;
var serverName = config.serverName;
var roles = config.authorizedRoles;
var nsfwrole = config.nsfwRole;
var jokes = config.jokes;
var eightball = config.eightball;


var commands = [

{
        command: "commands",
        description: "Displays this message, duh!",
        parameters: [],
	permissions: 0,
        execute: function(message, params) {
                var response = "Available commands:";

                for(var i = 0; i < commands.length; i++) {
                        var c = commands[i];
			if (c.permissions == 0) {
	                        response += "\n!" + c.command;

	                        for(var j = 0; j < c.parameters.length; j++) {
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
	permissions: 0,
	execute: function(message, params) {
		message.reply("Soon!");
	}
},


{
        command: "changename",
        description: "Bot will change nickname",
        parameters: [],
	permissions: 1,
        execute: function(message, params) {
		let nickname = message.content.substr("!changename ".length);
                bot.user.setUsername(nickname);
        }
},


{
        command: "joke",
        description: "Bot will print random joke",
        parameters: [],
        permissions: 0,
        execute: function(message, params) {
		message.channel.send(jokes[Math.floor(Math.random()*jokes.length)])
        }
},

{
        command: "eightball",
        description: "Bot will print eightball answer",
        parameters: [],
        permissions: 0,
        execute: function(message, params) {
                message.channel.send(eightball[Math.floor(Math.random()*eightball.length)])
        }
},

{
        command: "prune",
        description: "Deletes number of messages you want to delete",
        parameters: ["Count of messages"],
	permissions: 1,
        execute: function(message, params) {
		let messagecount = parseInt(params[1]);
		if (messagecount > 0 && messagecount < 101)
		{
	                message.channel.fetchMessages({limit: (messagecount + 1)}).then(messages => {
				message.channel.bulkDelete(messages);
				messagesDeleted = messages.array().length;
	                	message.channel.send("Clearing the area! "+messagesDeleted+" messages deleted.");
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
	permissions: 0,
        execute: function(message, params) {
		if(!message.member.roles.find("name", nsfwrole)){
			let role = message.guild.roles.find("name", nsfwrole);
			message.member.addRole(role);
			var nsfw_msg = fs.readFileSync("/src/addon/nsfw_rules.txt", {"encoding": "utf-8"});
			message.author.send(nsfw_msg);
		}
        }
},


{
	command: "status",
	description: "Bot will check and reply server status",
	parameters: [],
	permissions: 0,
	execute: function(message, params) {
		var client = new net.Socket();
		client.setTimeout(1000);
		client.connect(config.serverport, config.serverhost, function() {
			//console.log('Connected');
			client.write(buff);
			client.on('data', function(data) {
				//console.log('Received: ' + data);
				var buffer = new Buffer('', 'hex');
				buffer = Buffer.concat([buffer, new Buffer(data, 'hex')]);
				online = buffer.readUInt32LE(0);
				uptime = buffer.readUInt32LE(4);
				//console.log(online);
				if(online != '')
				{
					var uptimems = Math.round(uptime * 1000);
					var datetimenow = Date.now();
					var uptimets = Math.round(datetimenow - uptimems);
					moment.locale('en');
					var day = moment(uptimets).toNow(true);
					message.reply("Server status: online.\r\nPlayers online: "+online+"\r\n" + day + " since last restart");
				}
				else
				{
					message.reply("Server status: offline!");
				}
			});
			client.on('error', function(err){ message.reply("Server status: offline!"); });
			client.on('timeout', function(err){ message.reply("Server status: offline!"); });
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
	                if(message.isMentioned(bot.user)) {
	                        message.reply(mention_text);
	                } else {
	                        var message_text = message.content;
	                        if(message_text[0] == '!') { //Command issued
	                                handle_command(message, message_text.substring(1));
	                        }
			}
		}
});

function search_command(command_name) {
        for(var i = 0; i < commands.length; i++) {
                if(commands[i].command == command_name.toLowerCase()) {
                        return commands[i];
                }
        }

        return false;
}


function handle_command(message, text) {
	var params = text.split(" ");
	var command = search_command(params[0]);
	if(command) {
		if(message.channel.type !== "dm" && message.author.id !== bot.user.id) {
		        if(command.permissions > 0 && message.member.roles.some(r=>roles.includes(r.name))){
				if(params.length - 1 < command.parameters.length) {
					message.reply("Insufficient parameters!");
				} else {
					command.execute(message, params);
				}
			} else if(command.permissions > 0){
				message.reply("Insufficient permissions!");
			} else{
                                if(params.length - 1 < command.parameters.length) {
                                        message.reply("Insufficient parameters!");
                                } else {
                                        command.execute(message, params);
                                }
			}
		}
	}
}


bot.run = function(server_name, token) {


	bot.on("ready", () => {
		var server = bot.guilds.find("name", server_name);
		if(server === null) throw "Couldn't find server '" + server_name + "'";

		bot.user.setActivity('Say !commands');

		console.log("Connected!");
	});

	bot.login(token);
}

bot.run(serverName, botToken);
