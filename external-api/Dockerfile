FROM node:12

WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install

COPY . .
RUN yarn build

EXPOSE 3003
CMD [ "/usr/local/bin/npm", "run", "server" ]
