const express = require("express");
require('express-async-errors');
const { verifyToken } = require('./jwt/jwt')
const { init } = require('./db/mongoose')
const { getAllProducts, getProduct, updateProduct, createOrUpdateProduct } = require('./db/repository')
const { getTicket,
    listTicketsByAddress,
    wear,
    provideResult,
    provideRejection } = require('./db/ticketRepository')
const { getStockSupply, getAddressSupply } = require('./alchemy/alchemy')
const { fireNotification } = require('./notification/client')
const Storage = require('./storage/index')


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

const getAddressProducts = async (address, filter) => {
    const products = await getAllProducts(filter)
    const productRequest = products.map(p => ({
        contractId: p.contractId,
        tokenTypeId: p.tokenTypeId
    }))
    const supplies = await getAddressSupply(address, productRequest)
    const result = []
    for (let supply of supplies) {
        const product = products.find(p => p.contractId === supply.contractId && p.tokenTypeId === supply.tokenId)
        result.push({
            product,
            supply: supply.supply
        })
    }
    return JSON.parse(JSON.stringify(result))
}

app.get("/warehouse/products", async (_, res) => {
    const result = await getAllProducts()
    res.status(200).json(result)
})

app.post("/warehouse/products", verifyToken('ADMIN'), async (req, res) => {
    const result = await createOrUpdateProduct(req.body)
    res.status(200).json(result)
})

app.put("/warehouse/products/:id", verifyToken('ADMIN'), async (req, res) => {
    const id = req.params.id
    const result = await updateProduct(id, req.body)
    res.status(200).json(result)
})

app.get("/warehouse/products/my", verifyToken(), async (req, res) => {
    const address = req.user.user_id
    const filter = {}

    if (!!req.query.metaverseId) {
        filter['metaverseId'] =  req.query.metaverseId;
    }

    const result = await getAddressProducts(address, filter)

    res.status(200).json(result)
})

app.get("/warehouse/products/:id", async (req, res) => {
    const id = req.params.id
    const result = await getProduct(id)
    res.status(200).json(result)
})

app.get("/warehouse/products/:id/supply", async (req, res) => {
    const id = req.params.id
    const result = await getProduct(id)
    const supply = await getStockSupply(result.contractId, result.tokenTypeId)
    res.status(200).json(supply)
})

app.get("/wardrobe", verifyToken(), async (req, res) => {
    const address = req.user.user_id
    const tickets = await listTicketsByAddress(address)
    const products = await getAddressProducts(address)
    const allProducts = await getAllProducts()
    const result = []
    for (let ticket of tickets) {
        if (ticket.type === 'rent') {
            const product = allProducts.find(p => p._id === ticket.productId)
            if (product) {
                result.push({
                    ticket,
                    items: product
                })
            }
        } else {
            const product = products.find(p => p.product._id === ticket.productId)
            if (product) {
                result.push({
                    ticket,
                    items: product
                })
            }
        }
    }
    res.status(200).json(result)
})

app.post("/wardrobe/:id/wear", verifyToken(), async (req, res) => {
    const id = req.params.id
    const address = req.user.user_id

    const {
        sourceImageLinks
    } = req.body

    const ticket = await getTicket(id)
    const products = await getAddressProducts(address)
    const allProducts = await getAllProducts()
    let product = null
    if (ticket.type === 'buy') {
        product = products.map(p => p.product).find(p => p._id === ticket.productId)
    } else {
        product = allProducts.find(p => p._id === ticket.productId)
    }

    
    if (!product) {
        throw new Error(`Do not own a product with id ${ticket.productId}`)
    }

    const result = await wear(id, address, sourceImageLinks)
    fireNotification('NEW_WEAR_REQUEST', {
        user_id: address,
        item_name: product.name
    })
    res.status(200).json(result)
})

app.post("/wardrobe/:id/reject", verifyToken('ADMIN'), async (req, res) => {
    const id = req.params.id

    const {
        rejectComment
    } = req.body

    const result = await provideRejection(id, rejectComment)
    res.status(200).json(result)
})

app.post("/wardrobe/:id/result", verifyToken('ADMIN'), async (req, res) => {
    const id = req.params.id

    const {
        resultImageLinks
    } = req.body

    const result = await provideResult(id, resultImageLinks)
    res.status(200).json(result)
})

app.use('/storage', Storage)
app.use(jsonErrorHandler);

const runStart = async() => {
    await init();
}

runStart()

console.log(`Application is runnig on 3002`)
app.listen(3002)