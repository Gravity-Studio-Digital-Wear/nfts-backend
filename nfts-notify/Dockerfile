FROM node:12

WORKDIR /usr/src/app
COPY package*.json yarn.lock ./
RUN yarn install
COPY . .
CMD [ "/usr/local/bin/npm", "run", "server" ]
