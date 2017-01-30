# FOnline-discord-bot
Bot for FOnline Discord communities based on discord.js and https://github.com/agubelu/discord-music-bot.

For running bot you need a linux machine with installed docker. You need to run following command:

```docker run --restart=always -v <path to config.json>:/src/config.json brightside/fonline-discord-bot```

`<path to config.json>` - full path to config.json (you can find example in repo), which contains bot parameters, such as serverport (port of FOnline server), serverhost (domain name or IP address of FOnline server), nicknames (array, bot can change it periodically), changetime (nickname from array changetime, in minutes), bottoken (token for bot user on Discord, you can generate it in [Discord devepopers portal](https://discordapp.com/developers))

After docker container starts, register a new Discord application for your own instance of the bot. Keep track of the Client ID and your token.

It's time to make the bot join your server: replace your Client ID on this URL and navigate to it https://discordapp.com/oauth2/authorize?&client_id=YOUR_CLIENT_ID_HERE&scope=bot&permissions=0

If you need to modify/customize some features (for example, bot avatar), fork repo and change its content (server.js, dockerfile or avatar)
