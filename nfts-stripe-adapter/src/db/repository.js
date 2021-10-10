const { Product, UpdateStatus, Checkout } = require('./schema')

const listProductsForSync = async () => {
    let updateStatuses = await UpdateStatus.find({ _id: "updateStatus" })
    let firstUpdated = false
    if (updateStatuses.length === 0) {
        console.log(`DB listProductsForSync there was no updates, syncing all`)
        firstUpdated = true
    }

    let productsToUpdate = []
    if (firstUpdated) {
        productsToUpdate = await Product.find({})
    } else {
        productsToUpdate = await Product.find({ updatedAt: { $gte: updateStatuses[0].lastUpdated } })
    }

    if (productsToUpdate.length > 0) {
        console.log(`DB listProductsForSync found ${productsToUpdate.length} products to sync`)
    }
    return productsToUpdate;
}

const updateSuccessful = async() => {
    const now = new Date()
    let updateStatuses = await UpdateStatus.find({ _id: "updateStatus" })
    let result = null
    if (updateStatuses.length === 0) {
        result = new UpdateStatus({_id: "updateStatus", lastUpdated: now})
    } else {
        result = updateStatuses[0]
        result.lastUpdated = now
    }
    result = await result.save()
    console.log(`DB updateSuccessful new lastUpdated = ${now}`)
    return result
}

const createCheckout = async(accountId, paymentIntent, cart) => {
    const checkout = new Checkout({
        _id: paymentIntent,
        status: 'NEW',
        paymentIntent,
        accountId,
        cart
    })
    const result = await checkout.save()
    console.log(`DB createCheckout created new checkout for intent ${paymentIntent}`)
    return result
}

const transitCheckout = async(id, status) => {
    let checkout = await Checkout.findById(id)
    if (checkout != null) {
        checkout.updatedAt = new Date()
        checkout.status = status
        checkout = await checkout.save()
    } else {
        throw new Error('Checkout not found')
    }
    console.log(`DB tramsitCheckout transited checkout ${id} to ${status}`)
    return checkout
}

module.exports = {
    listProductsForSync,
    updateSuccessful,
    createCheckout,
    transitCheckout
}