const Web3 = require('web3');
const { ABI } = require('./ERC1155ABI')

const { getProducts } = require('../db/repository')
const { getBlockNumber,
    updateBlockNumber,
    saveNewLog } = require('../db/eventRepository')
const { init } = require('../db/mongoose')

if (!process.env.STOCKS_ACCOUNT) {
    console.error("STOCKS_ACCOUNT is required!")
    process.exit(0)
}

if (!process.env.POLL_INTERVAL) {
    console.error("POLL_INTERVAL is required!")
    process.exit(0)
}

if (!process.env.STOCKS_ACCOUNT_PRIVATE_KEY) {
    console.error("STOCKS_ACCOUNT_PRIVATE_KEY is required!")
    process.exit(0)
}

const PROVIDER_URL = process.env["WEB3_PROVIDER_URL"];
const STOCKS_ACCOUNT = process.env["STOCKS_ACCOUNT"];
const POLL_INTERVAL = process.env["POLL_INTERVAL"];

const provider = new Web3.providers.HttpProvider(PROVIDER_URL);
const web3 = new Web3(provider);

const getSingleEvents = async(contract, filter, fromBlock, toBlock) => {
    const type = 'TransferSingle'
    const result = await contract.getPastEvents(type, {
        filter,
        fromBlock,
        toBlock
    })

    const resultAsArray = JSON.parse(JSON.stringify(result))
    const logs = resultAsArray.map(log => ({
        type,
        contractId: log.address,
        tokenTypeId: log.returnValues.id,
        recipient: log.returnValues.to,
        sender: log.returnValues.from,
        _id: log.id,
        amount: Number.parseInt(log.returnValues.value),
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        status: 'NEW'
    }))

    console.log(`getSingleEvents returns ${logs.length}`)
    return logs
}

const getBatchEvents = async(contract, filter, fromBlock, toBlock) => {
    const type = 'TransferBatch'
    const result = await contract.getPastEvents(type, {
        filter,
        fromBlock,
        toBlock
    })

    const resultAsArray = JSON.parse(JSON.stringify(result))
    const logs = resultAsArray.flatMap(log => {
        const result = []
        const subEvents = log.returnValues.ids.length
        for (let i = 0; i < subEvents; i++) {
            result.push(
                {
                    type,
                    contractId: log.address,
                    tokenTypeId: log.returnValues.ids[i],
                    recipient: log.returnValues.to,
                    sender: log.returnValues.from,
                    _id: log.id,
                    amount: Number.parseInt(log.returnValues.values[i]),
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                    status: 'NEW'
                }
            )
        }
        return result
    })

    console.log(`getBatchEvents returns ${logs.length}`)
    return logs
}

const run = async () => {
    try {
        await init()
        console.log(`Getting products`)
        const products = await getProducts()
        console.log(`Got product`)
        const contracts = [...new Set(products.map(p => p.contractId))]
        const tokenIds = [...new Set(products.map(p => p.tokenTypeId))]
        const fromBlock = await getBlockNumber()
        const lastBlock = await web3.eth.getBlockNumber()
        for (let contractId of contracts) {
            console.log(`[Observer] Connecting to ${contractId}`)
            const contract = new web3.eth.Contract(ABI, contractId)
            const filter = {
                from: STOCKS_ACCOUNT
            }
            const logsSingle = await getSingleEvents(contract, filter, fromBlock, lastBlock)
            const logsMulti = await getBatchEvents(contract, filter, fromBlock, lastBlock)
            const logs = [...logsSingle, ...logsMulti]

            const filteredLogs = logs.filter(l => tokenIds.includes(l.tokenTypeId))
            for (let filteredLog of filteredLogs) {
                if (await saveNewLog(filteredLog)) {
                    console.log(`[Observer] Saved new log ${filteredLog._id} for tx ${filteredLog.transactionHash}`)
                }
            }

            if (filteredLogs.length === 0) {
                console.log(`[Observer] no new events from ${fromBlock} - ${lastBlock} (${lastBlock-fromBlock}) blocks`)
            }

            await updateBlockNumber(lastBlock)
            console.log(`[Observer] new height is ${lastBlock}`)
        }
    } catch (e) {
        console.error(`Error while listening for events: ` + e)
    }
}

const runRepeated = async() => {
    await run()
    setTimeout(runRepeated, POLL_INTERVAL)
}

module.exports = {
    runRepeated
}