const { Product, UpdateStatus, Checkout } = require('./schema')

const getProduct = async(id) => {
    const products = await Product.find({"_id": id})
    let result = products.length > 0 ? products[0] : undefined
    console.log(`DB getProduct found ${products.length} products for id ${id}`)
    return result
}

const processOrderInQueue = async(processor) => {
    const order = await Checkout.findOneAndUpdate({ status: 'SUCCESS' }, { status: 'PROCESSING' })
    if (order) {
        console.log(`DB processOrderInQueue found order ${order._id} for processing`)
        try {
            const result = await processor(order)
            if (result.success) {
                console.log(`DB processOrderInQueue success processing order ${order._id}`)
                await Checkout.findOneAndUpdate({ _id: order.id }, { status: 'FULFILLED', fulfillment: result.fulfillment })
                console.log(`DB processOrderInQueue FULFILLED order ${order._id}`)
            } else {
                console.log(`DB processOrderInQueue business error processing order ${order._id}`)
                await Checkout.findOneAndUpdate({ _id: order.id }, { status: 'NOT_FULFILLED', fulfillmentError: result.fulfillmentError })
                console.log(`DB processOrderInQueue NOT_FULFILLED order ${order._id}`)
            }
        } catch (e) {
            console.error(e)
            console.log(`DB processOrderInQueue technical failed processing order ${order._id}`)
            await Checkout.findOneAndUpdate({ _id: order.id }, { status: 'SUCCESS' })
        }
    }
}

module.exports = {
    getProduct,
    processOrderInQueue
}