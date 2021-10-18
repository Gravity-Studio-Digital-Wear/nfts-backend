const fetch = require('node-fetch')

if (!process.env.NOTIFY_SERVICE) {
    console.error("NOTIFY_SERVICE is required!")
    process.exit(0)
}

const NOTIFY_SERVICE = process.env.NOTIFY_SERVICE

const fireNotification = (code, params) => {
    const url = `${NOTIFY_SERVICE}/notification/push/send`
    const payload = {
        templateId: code,
        parameters: params
    }

    fetch(url, {
        method: 'POST',
        Headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then(res => {
        const json = res.json()
        if (json.success) {
            console.log(`Success sending notification ${code}`)
        } else {
            console.error(`Error sending notification ${code}, reason: ${json.reason}`)
        }
    }).catch(err => {
        console.error(`System rrror sending notification ${code}, reason: ${err}`)
    })
}

module.exports = {
    fireNotification
}