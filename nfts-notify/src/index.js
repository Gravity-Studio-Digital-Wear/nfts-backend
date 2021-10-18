const express = require("express");
require('express-async-errors');
const { init } = require('./db/mongoose')
const { getTemplate, saveTemplate } = require('./db/repository')
const { createMessageAndSend } = require('./notification/telegram')


const app = express();

const jsonErrorHandler = async (err, req, res, next) => {
    console.error(err)
    if (JSON.stringify(err) === '{}') {
        res.status(500).json({ error: err.message });
    } else {
        res.status(500).json({ error: err });
    }
}

app.use(express.json());

if (!process.env.TOKEN_KEY) {
    console.error("TOKEN_KEY is required!")
    process.exit(0)
}

app.post('/notification/push/send', async (req, res) => {
    const { templateId, parameters } = req.body
    const template = await getTemplate(templateId)
    const templateMessage = template.messageTemplate
    
    try {
        await createMessageAndSend(templateMessage, parameters)
        res.status(200).json({
            success: true
        })
    } catch (e) {
        res.status(403).json({
            success: false,
            reason: "" + e
        })
    }
});

app.post('/notification/templates', async (req, res) => {
    const { _id, messageTemplate, description } = req.body
    const template = await saveTemplate({_id, messageTemplate, description})
    res.status(200).json(template)
});

app.use(jsonErrorHandler);

init()
console.log(`Application is runnig on 3005`)
app.listen(3005)