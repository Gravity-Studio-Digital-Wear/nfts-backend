const { ABI } = require('./ERC1155ABI') 

if (!process.env.STOCKS_ACCOUNT) {
    console.error("STOCKS_ACCOUNT is required!")
    process.exit(0)
}

if (!process.env.WEB3_PROVIDER_URL) {
    console.error("WEB3_PROVIDER_URL is required!")
    process.exit(0)
}

const PROVIDER_URL = process.env["WEB3_PROVIDER_URL"];
const STOCKS_ACCOUNT = process.env["STOCKS_ACCOUNT"];

const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider(PROVIDER_URL);
const web3 = new Web3(provider);

const getStockSupply = async (contractId, tokenId) => {
    if (!contractId || !tokenId) {
        throw new Error('Invalid getStockSupply parameters')
    }
    console.log(`WEB3 getStockSupply for contractId=${contractId} tokenId=${tokenId}`)
    const contract = new web3.eth.Contract(ABI, contractId)
    const remaningSupply = await contract.methods.balanceOf(STOCKS_ACCOUNT, tokenId).call();
    const maxSupply = await contract.methods.maxSupply(tokenId).call()
    return {
        remaningSupply,
        maxSupply
    }
}
module.exports = {
    getStockSupply
}