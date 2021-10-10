const { listProductsForSync, updateSuccessful, createCheckout, transitCheckout } = require('../db/repository')
if (!process.env.STRIPE_SK) {
    console.error("STRIPE_SK is required!")
    process.exit(0)
}
//if (!process.env.STRIPE_WHSEC) {
//    console.error("STRIPE_WHSEC is required!")
//    process.exit(0)
//}
if (!process.env.REDIRECT_BASE_URL) {
    console.error("REDIRECT_BASE_URL is required!")
    process.exit(0)
}

const STRIPE_SK = process.env.STRIPE_SK
//const STRIPE_WHSEC = process.env.STRIPE_WHSEC
const REDIRECT_BASE_URL = process.env.REDIRECT_BASE_URL
const SYNC_INTERVAL = 10000

const stripe = require('stripe')(STRIPE_SK);

const syncAllProducts = async () => {
    console.log(`syncAllProducts triggered...`)
    const toSync = await listProductsForSync()
    for (p of toSync) {
        await handleProductUpdatedInDb(p)
    }
    await updateSuccessful()

    setTimeout(syncAllProducts, SYNC_INTERVAL)
}

const handleProductUpdatedInDb = async (product) => {
    let productId = ''
    try {
        const res = await stripe.products.create({
            id: product.id,
            name: product.name,
            active: product.active,
            description: product.description,
            metadata: {
                contractId: product.contractId,
                tokenTypeId: product.tokenTypeId
            },
            images: product.images
        });
        console.log(`Stripe handleProductUpdatedInDb created stripe product for id ${product._id}`)
        productId = res.id
    } catch (e) {
        const res = await stripe.products.update(product.id, {
            name: product.name,
            active: product.active,
            description: product.description,
            metadata: {
                contractId: product.contractId,
                tokenTypeId: product.tokenTypeId
            },
            images: product.images
        });
        productId = res.id
        console.log(`Stripe handleProductUpdatedInDb updated stripe product for id ${product._id}`)
    }

    const productPricesRs = await stripe.prices.list({
        product: productId,
        active: true
    });

    const productPrices = productPricesRs.data
    if (productPrices.length === 0) {
        console.log(`Stripe handleProductUpdatedInDb creating price for product id ${product._id}, price ${product.priceUSD}`)
        await stripe.prices.create({
            unit_amount: product.priceUSD,
            currency: 'usd',
            product: productId,
        });
        console.log(`Stripe handleProductUpdatedInDb created stripe price for product id ${product._id}`)
    } else {
        const price = productPrices[0].unit_amount
        if (price != product.priceUSD) {
            await stripe.prices.update(productPrices[0].id, {
                active: false
            });
            console.log(`Stripe handleProductUpdatedInDb deactivated old price for product id ${product._id}`)
            await stripe.prices.create({
                unit_amount: product.priceUSD,
                currency: 'usd',
                product: productId,
            });
            console.log(`Stripe handleProductUpdatedInDb created stripe price for product id ${product._id}`)
        } else {
            console.log(`Stripe handleProductUpdatedInDb no price update required for product id ${product._id}`)
        }
    }
}

const checkout = async (accountId, cart) => {
    const lines = []
    const cartFull = []
    for (let item of cart) {
        const productPricesRs = await stripe.prices.list({
            product: item.productId,
            active: true
        });

        const productPrices = productPricesRs.data
        if (productPrices.length !== 1) {
            throw Error('Unable to process checkout. Price missing or invalid product')
        }

        lines.push({
            price: productPrices[0].id,
            quantity: item.quantity
        })

        cartFull.push({
            productId: item.productId,
            priceId: productPrices[0].id,
            quantity: item.quantity
        })
    }

    const session = await stripe.checkout.sessions.create({
        line_items: lines,
        payment_method_types: [
            'card',
        ],
        mode: 'payment',
        success_url: `${REDIRECT_BASE_URL}?success=true`,
        cancel_url: `${REDIRECT_BASE_URL}?canceled=true`,
    });

    const paymentIntent = session.payment_intent
    await createCheckout(accountId, paymentIntent, cartFull)

    return session.url
}

const handleSuccess = async (event) => {
    await transitCheckout(event.id, 'SUCCESS')
}

const handleCancel = async (event) => {
    await transitCheckout(event.id, 'CANCELLED')
}

const initSync = () => {
    console.log(`Product sync started`)
    setTimeout(syncAllProducts, 0)
}

module.exports = {
    initSync,
    checkout,
    handleSuccess,
    handleCancel
}