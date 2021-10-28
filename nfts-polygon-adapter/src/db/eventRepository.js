const { Log, BlockNumber } = require('./schema')

if (!process.env.START_BLOCK_NUMBER) {
    console.error("START_BLOCK_NUMBER is required!")
    process.exit(0)
}

const START_BLOCK_NUMBER = process.env.START_BLOCK_NUMBER

const getBlockNumber = async () => {
    let blockNumber = await BlockNumber.findById('default')
    if (!blockNumber) {
        blockNumber = new BlockNumber({
            _id: 'default',
            lastBlock: START_BLOCK_NUMBER
        })
        blockNumber = await blockNumber.save()
    }
    return blockNumber.lastBlock
}

const updateBlockNumber = async (lastBlockNumber) => {
    let blockNumber = await BlockNumber.findById('default')
    blockNumber.lastBlock = lastBlockNumber
    await blockNumber.save()
}

const saveNewLog = async(log) => {
    let newLog = await Log.findById(log._id)
    if (!newLog) {
        newLog = new Log(log)
        await newLog.save()
        return true
    }
    return false
}

const processLogInQueue = async(processor) => {
    const log = await Log.findOneAndUpdate({ status: 'NEW' }, { status: 'PROCESSING' })
    if (log) {
        console.log(`DB processLogInQueue found log ${log._id} for processing`)
        try {
            const result = await processor(log)
            if (result.success) {
                console.log(`DB processLogInQueue success processing log ${log._id}`)
                await Log.findOneAndUpdate({ _id: log.id }, { status: 'COMPLETED', fulfillment:result.fulfillment })
                console.log(`DB processLogInQueue COMPLETED log ${log._id}`)
            } else {
                console.log(`DB processLogInQueue business error processing log ${log._id}`)
                await Log.findOneAndUpdate({ _id: log.id }, { status: 'FAILED', fulfillmentError: result.fulfillmentError })
                console.log(`DB processLogInQueue FAILED log ${log._id}`)
            }
        } catch (e) {
            console.error(e)
            console.log(`DB processLogInQueue technical failed processing log ${log._id}`)
            await Log.findOneAndUpdate({ _id: log.id }, { status: 'NEW' })
        }
    }
}

module.exports = {
    getBlockNumber,
    updateBlockNumber,
    saveNewLog,
    processLogInQueue
}