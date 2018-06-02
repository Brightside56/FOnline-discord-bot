FROM mhart/alpine-node:10
MAINTAINER Oleg Gumbar <brightside@fonline-status.ru>

WORKDIR /src


ADD fonlinebot.js /src/
ADD ./addon /src/addon/

RUN apk update
RUN apk add --no-cache make gcc g++ python mc htop nano openssl
#RUN apk add --update ffmpeg
#RUN npm install ytdl-core
#RUN npm install node-opus
RUN npm install discord.js
RUN npm install unique-random-array
RUN npm install request
RUN npm install math
RUN npm install moment

CMD ["node", "fonlinebot.js"]
