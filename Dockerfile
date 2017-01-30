FROM mhart/alpine-node:4
MAINTAINER Oleg Gumbar <brightside@fonline-status.ru>

WORKDIR /src

ADD	server.js /src/
ADD	avatar.png /src/

RUN apk update
RUN apk add --no-cache make gcc g++ python mc htop nano openssl
RUN apk add --update ffmpeg
RUN npm install discord.io
RUN npm install unique-random-array
RUN npm install math
RUN npm install moment

CMD ["node", "fonlinebot.js"]
