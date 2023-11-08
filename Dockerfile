FROM keymetrics/pm2:14-alpine

# COPY Bundle APP files
WORKDIR /node/src/kayaroll-api
ADD . /node/src/kayaroll-api

COPY . .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install
RUN apk add --no-cache ffmpeg

ARG APP_ENV
ENV env_state=$APP_ENV

EXPOSE 7070

CMD ["pm2-runtime", "server.js"]