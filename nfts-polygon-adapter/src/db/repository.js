const { Product, Checkout, WearTicket } = require('./schema')

const issueTickets = async (productId, address, quantity, type = 'buy') => {
    if (!productId || !address || !quantity) {
        throw new Error('Invalid call to issueTickets')
    }

    const tickets = []
    for (let i = 0; i < quantity; i++) {
        let ticket = new WearTicket({productId, address, status: 'NEW', type})
        ticket = await ticket.save()
        tickets.push(ticket)
    }

    console.log(`DB issueTickets issued ${quantity} tickets for products id ${productId} for ${address}`)
    return tickets
}

const getProduct = async(id) => {
    const products = await Product.find({"_id": id})
    let result = products.length > 0 ? products[0] : undefined
    console.log(`DB getProduct found ${products.length} products for id ${id}`)
    return result
}

const getRentProduct = async(id) => {
    const products = await Product.find({})
    const result = products.find(p => p.rentProductId === id)
    console.log(`DB getRentProduct found ${result ? 1 : 0} rent products for id ${id}`)
    return result
}

const getProductByContractIdAndTokenTypeId = async(contractId, tokenTypeId) => {
    const products = await Product.find({'contractId': new RegExp(`^${contractId}$`, 'i'), tokenTypeId})
    let result = products.length > 0 ? products[0] : undefined
    console.log(`DB getProductByContractIdAndTokenTypeId found ${products.length} products for contractId ${contractId} tokenTypeId ${tokenTypeId}`)
    return result
}

const getProducts = async() => {
    let products = await Product.find({})
    console.log(`DB getProducts found ${products.length} products`)
    return products
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
    issueTickets,
    getProduct,
    getRentProduct,
    getProducts,
    processOrderInQueue,
    getProductByContractIdAndTokenTypeId
}