const express = require("express");
require('express-async-errors');
const { verifyToken } = require('./jwt/jwt')
const { init } = require('./db/mongoose')
const { getAllProducts, getProduct, updateProduct, createOrUpdateProduct } = require('./db/repository')
const { getStockSupply } = require('./alchemy/alchemy')

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

app.get("/warehouse/products", async (_, res) => {
    const result = await getAllProducts()
    res.status(200).json(result)
})

app.post("/warehouse/products", verifyToken, async (req, res) => {
    const result = await createOrUpdateProduct(req.body)
    res.status(200).json(result)
})

app.put("/warehouse/products/:id", verifyToken, async (req, res) => {
    const id = req.params.id
    const result = await updateProduct(id, req.body)
    res.status(200).json(result)
})

app.get("/warehouse/products/:id", async (req, res) => {
    const id = req.params.id
    const result = await getProduct(id)
    res.status(200).json(result)
})

app.get("/warehouse/products/supply/:id", async (req, res) => {
    const id = req.params.id
    const result = await getProduct(id)
    const supply = await getStockSupply(result.contractId, result.tokenTypeId)
    res.status(200).json(supply)
})

app.use(jsonErrorHandler);

init()
console.log(`Application is runnig on 3002`)
app.listen(3002)