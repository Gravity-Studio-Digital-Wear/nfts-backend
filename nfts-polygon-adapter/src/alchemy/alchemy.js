const { ABI } = require('./ERC1155ABI') 

if (!process.env.STOCKS_ACCOUNT) {
    console.error("STOCKS_ACCOUNT is required!")
    process.exit(0)
}

if (!process.env.STOCKS_ACCOUNT_PRIVATE_KEY) {
    console.error("STOCKS_ACCOUNT_PRIVATE_KEY is required!")
    process.exit(0)
}

if (!process.env.WEB3_PROVIDER_URL) {
    console.error("WEB3_PROVIDER_URL is required!")
    process.exit(0)
}

const PROVIDER_URL = process.env["WEB3_PROVIDER_URL"];
const STOCKS_ACCOUNT = process.env["STOCKS_ACCOUNT"];
const STOCKS_ACCOUNT_PRIVATE_KEY = process.env["STOCKS_ACCOUNT_PRIVATE_KEY"];
const ORDER_PROCESSING_TIMEOUT = 1000

const Web3 = require('web3');
const { init } = require('../db/mongoose')
const { getProduct, processOrderInQueue, issueTickets, getRentProduct } = require('../db/repository')

const provider = new Web3.providers.HttpProvider(PROVIDER_URL);
const web3 = new Web3(provider);

web3.eth.accounts.wallet.add(STOCKS_ACCOUNT_PRIVATE_KEY)

const fillfillOrder = async (order) => {
    const result = []
    const {
        _id: orderId, cart, accountId: recipient
    } = order
    console.log(`WEB3 fillfillOrder for order ${orderId} from account ${STOCKS_ACCOUNT} to recipient: ${recipient}`)
    if (!recipient) {
        console.error(`WEB3 unable to process order ${orderId} wihhout recipient`)
        return {
            success: false,
            fulfillment: result,
            fulfillmentError: 'INVALID_ORDER_NO_RECIPIENT'
        }
    }

    for (let item of cart) {
        const product = await getProduct(item.productId)
        if (product) {
            await fullfillBuyOrder(product, item, result, orderId, recipient)
        }
        const rentProduct = await getRentProduct(item.productId)
        if (rentProduct) {
            await fullfillRentOrder(rentProduct, item, result, recipient)
        }
    }
    
    return {
        success: true,
        fulfillment: result
    }
}

const fullfillBuyOrder = async (product, item, result, orderId, recipient) => {
    const contractId = product.contractId
    const tokenTypeId = product.tokenTypeId
    const contract = new web3.eth.Contract(ABI, contractId)
    const balance = contract.methods.balanceOf(STOCKS_ACCOUNT, tokenTypeId).call();
    if (Number.parseInt(balance) < item.quantity) {
        console.error(`WEB3 unable to process order ${orderId} insufficient balance`)
        return {
            success: false,
            fulfillment: result,
            fulfillmentError: 'INSF_TOKEN_BALANCE'
        }
    }

    
    console.log(`WEB3 fillfillOrder prepare transaction for order line ${orderId} token ${tokenTypeId} qty ${item.quantity}`)
    const gasPrice = await web3.eth.getGasPrice()
    const receipt = await contract.methods.safeTransferFrom(
        STOCKS_ACCOUNT, // from
        recipient,      // to
        tokenTypeId,    // token id
        item.quantity,  // amount of tokens,
        "0x0"           // empty calldate bytes
    ).send({
        from: STOCKS_ACCOUNT,
        gas: "210000",
        gasPrice
    });
    const hash = receipt.transactionHash ? receipt.transactionHash : receipt
    console.log(`WEB3 fillfillOrder sent transaction id ${hash} for order line ${orderId}`)
    result.push(hash)
}

const fullfillRentOrder = async (product, item, result, recipient) => {
    console.log(`WEB3 fillfillOrder issue ${item.quantity} 'rent tickets' for product ${product._id}`)
    const tickets = await issueTickets(product._id, recipient, item.quantity, 'rent')
    tickets.map(t => t._id).forEach(id => {
        result.push(id)
    })
}

const processOrder = async() => {
    await processOrderInQueue(fillfillOrder)
    setTimeout(processOrder, ORDER_PROCESSING_TIMEOUT)
}

const startProcessing = async () => {
    await init()
    console.log(`Order processing started...`)
    setTimeout(processOrder, 0)
}


module.exports = {
    fillfillOrder,
    startProcessing
}