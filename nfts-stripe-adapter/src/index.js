const express = require("express");
require('express-async-errors');
const { verifyToken } = require('./jwt/jwt')
const { init } = require('./db/mongoose')
const { initSync, checkout, handleSuccess, handleCancel } = require('./stripe/products')

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

app.post('/checkout/session', verifyToken, async (req, res) => {
    const { cart } = req.body
    const accountId = req.user.user_id
    const checkoutUrl = await checkout(accountId, cart)
    res.status(201).json({
        success: true,
        checkoutUrl
    })
});

app.post('/checkout/hooks', async (req, res) => {
    const event = req.body;

    // Handle the event
    switch (event.type) {
        case 'payment_intent.cancelled':
            {
                const paymentIntent = event.data.object;
                console.log(`Stripe. Events. PaymentIntent ${paymentIntent.id} for ${paymentIntent.amount} was cancelled!`);
                await handleCancel(paymentIntent)
                break;
            }
        case 'payment_intent.succeeded':
            {
                const paymentIntent = event.data.object;
                console.log(`Stripe. Events.PaymentIntent ${paymentIntent.id} for ${paymentIntent.amount} was successful!`);
                await handleSuccess(paymentIntent)
                break;
            }
        default:
            // Unexpected event type
            console.log(`Unhandled event type ${event.type}.`);
    }

    res.sendStatus(200)
});

app.use(jsonErrorHandler);

init()
initSync()
console.log(`Application is runnig on 3003`)
app.listen(3003)