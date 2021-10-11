const { Product } = require('./schema')

const createOrUpdateProduct = async(product) => {
    const products = await Product.find({name: product.name})
    let result = products.length > 0 ? products[0] : undefined
    console.log(`DB createOrUpdateProduct found ${products.length} products with name ${product.name}`)
    if (!result) {
        result = new Product(product)
    } else {
        Object.assign(result, product)
    }
    result.updatedAt = new Date()
    result = await result.save()
    console.log(`DB createOrUpdateProduct saved ${product.name}`)
    return result
}

const updateProduct = async(id, product) => {
    let result = await getProduct(id)
    if (result) {
        Object.assign(result, product)
    } else {
        console.log(`DB product with id ${id} not found`)
        throw Error(`Product with id ${id} not found`)
    }
    result.updatedAt = new Date()
    result = await result.save()
    console.log(`DB updateProduct saved ${product.name}`)
    return result
}

const getAllProducts = async() => {
    const products = await Product.find()
    console.log(`DB getAllProducts found ${products.length} products`)
    return products
}

const getProduct = async(id) => {
    const products = await Product.find({"_id": id})
    let result = products.length > 0 ? products[0] : undefined
    console.log(`DB getProduct found ${products.length} products for id ${id}`)
    return result
}

module.exports = {
    createOrUpdateProduct,
    getAllProducts,
    getProduct,
    updateProduct
}