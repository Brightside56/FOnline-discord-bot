FROM mhart/alpine-node:10
MAINTAINER Oleg Gumbar <brightside@fonline-status.ru>

WORKDIR /src

ADD ./src /src
ADD ./assets /src/assets

RUN apk update
#RUN apk add --no-cache make gcc g++ python mc htop nano openssl
RUN npm install discord.js request math moment csvtojson mysql async request-promise random-number

CMD ["node", "./fonlinebot.js"]
