const fetch = require('node-fetch')
const Handlebars = require("handlebars");

if (!process.env.TG_BOT_TOKEN) {
    console.error("TG_BOT_TOKEN is required!")
    process.exit(0)
}

if (!process.env.TG_BOT_CHAT) {
    console.error("TG_BOT_CHAT is required!")
    process.exit(0)
}

const TG_BOT_CHAT = process.env['TG_BOT_CHAT']
const TG_BOT_TOKEN = process.env['TG_BOT_TOKEN']

const sendUrl = (token, chat, text) => `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat}&text=${text}`

const createMessageAndSend = async(template, parameters) => {
    const compiled = Handlebars.compile(template)
    const result = compiled(parameters)
    const url = sendUrl(TG_BOT_TOKEN, TG_BOT_CHAT, result)
    const sendResult = await fetch(url)
    if (sendResult.status !== 200) {
        console.error(sendResult)
    }
}

module.exports = {
    createMessageAndSend
}