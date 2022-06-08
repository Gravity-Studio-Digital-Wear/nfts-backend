import { Service } from 'typedi'
import ERC1155ABI from './erc1155abi.json'
import {BigNumber, ethers} from "ethers";

const provider = new ethers.providers.JsonRpcProvider(process.env.WEB3_PROVIDER_URL)



@Service()
export class Contract {

   async getAddressSupply(contractAddress: string, address: string, tokenTypeIds: number[], ABI: any = ERC1155ABI): Promise<BigNumber[]> {
        const contract = new ethers.Contract(contractAddress, ABI, provider)

        const accounts = Array(tokenTypeIds.length).fill(address)

        return contract.balanceOfBatch(accounts, tokenTypeIds);
    }
}