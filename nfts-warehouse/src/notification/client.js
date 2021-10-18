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
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(payload)
    }).then(res => res.json()).then(json => {
        if (json.success) {
            console.log(`[Notify-Client] Success sending notification ${code}`)
        } else {
            console.error(`[Notify-Client] Error sending notification ${code}, reason: ${json.reason}`)
        }
    }).catch(err => {
        console.error(`[Notify-Client] System rrror sending notification ${code}, reason: ${err}`)
    })
}

module.exports = {
    fireNotification
}