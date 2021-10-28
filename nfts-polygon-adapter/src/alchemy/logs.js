const { processLogInQueue } = require('../db/eventRepository')
const { getProductByContractIdAndTokenTypeId, issueTickets } = require ('../db/repository')

const { init } = require('../db/mongoose')

if (!process.env.STOCKS_ACCOUNT) {
    console.error("STOCKS_ACCOUNT is required!")
    process.exit(0)
}

if (!process.env.LOG_PROCESSING_TIMEOUT) {
    console.error("LOG_PROCESSING_TIMEOUT is required!")
    process.exit(0)
}

const STOCKS_ACCOUNT = process.env["STOCKS_ACCOUNT"];
const LOG_PROCESSING_TIMEOUT = process.env["LOG_PROCESSING_TIMEOUT"]

const doProcessLog = async (log) => {
    if (log.sender === STOCKS_ACCOUNT) {
        const product = await getProductByContractIdAndTokenTypeId(log.contractId, log.tokenTypeId)
        if (product) {
            const productId = product._id
            const quantity = log.amount
            console.log(`LOGS doProcessLog issue ${quantity} tickets for product ${productId}`)
            const tickets = await issueTickets(productId, log.recipient, quantity)
            
            return {
                success: true,
                fulfillment: tickets.map(t => t._id)
            }
        } else {
            return {
                success: false,
                fulfillmentError: 'NO_PRODUCT_FOUND'
            }
        }
    } else {

        return {
            success: true,
            fulfillment: []
        }
    }
}

const processLog = async() => {
    await processLogInQueue(doProcessLog)
    setTimeout(processLog, LOG_PROCESSING_TIMEOUT)
}

const startProcessingLogs = async () => {
    await init()
    console.log(`Log processing started...`)
    setTimeout(processLog, 0)
}

module.exports = {
    processLog,
    startProcessingLogs
}