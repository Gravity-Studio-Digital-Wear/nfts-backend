import {Get, JsonController, QueryParam, QueryParams, Req, UseBefore} from "routing-controllers";
import {ApiKeyMiddleware} from "../middlewares/api-key-middleware";
import {Product} from "../schemas/products";
import {Contract} from "../web3/contract";
import {Service} from "typedi";

@JsonController('/nfts')
@Service()
export class NFTController {
    constructor(private contract: Contract) {
    }

    @Get('/')
    @UseBefore(ApiKeyMiddleware)
    async get(@Req() req: any) {
        const metaverseId = req.__metaverse;

        const products = await Product.aggregate([
            {
                $match: {
                    'metadata.metaverseId': metaverseId,
                },
            },
        ]).exec()

        return products.map((product) => {
            const {name, contractId, tokenTypeId, metadata} = product
            return {
                name,
                contractId,
                tokenTypeId,
                metadata: metadata.filter((t: any) => t.metaverseId === metaverseId)
            }
        })
    }

    @Get('/getByAddress')
    @UseBefore(ApiKeyMiddleware)
    async getNftsByAddress(@QueryParam('address') address: string, @Req() req: any) {
        const metaverseId = req.__metaverse;

        const products = await Product.aggregate([
            {
                $match: {
                    'metadata.metaverseId': metaverseId,
                },
            },
        ]).exec();


        const productsTokenTypesMap = products.reduce((acc, {contractId, tokenTypeId}) => {
            const contract = contractId.toLowerCase();

            return {
                ...acc,
                [contract]: [...(acc[contract] || []), tokenTypeId]
            }
        }, {} as Record<string, number[]>)


        const ownedProducts: Record<string, number[]> = {};
        for (const [contractId, tokenTypesIds] of Object.entries(productsTokenTypesMap as Record<string, number[]>)) {
            const res = await this.contract.getAddressSupply(contractId, address, tokenTypesIds as any);

            const owned = tokenTypesIds.filter((tokenTypesId: number, index) => {
                return res[index].gt(0)
            });


            ownedProducts[contractId] = owned;
        }

        return products
            .filter(p => {
                return ownedProducts[p.contractId.toLowerCase()]
                    && ownedProducts[p.contractId.toLowerCase()].includes(p.tokenTypeId)
            })
            .map((product) => {
                const {name, contractId, tokenTypeId, metadata} = product
                return {
                    name,
                    contractId,
                    tokenTypeId,
                    metadata: metadata.filter((t: any) => t.metaverseId === metaverseId)
                }
            });
    }


    @Get('/getModelByNft')
    @UseBefore(ApiKeyMiddleware)
    async getModelByNft(
        @QueryParam('tokenTypeId', {required: true}) tokenTypeId: string,
        @QueryParam('contractId', {required: true}) contractId: string,
        @Req() req: any,
        @QueryParams() params: any
    ) {
        const metaverseId = req.__metaverse;

        const queryParams: Record<string, string> = Object.keys(params)
            .filter(t => t.startsWith('param_'))
            .reduce((acc, qp) => {
                const paramName = qp.replace('param_', '')
                return {
                    ...acc,
                    [paramName]: params[qp]
                };
            }, {})

        const [res] =  await Product.aggregate([
            {
                $match: {
                    'metadata.metaverseId': metaverseId,
                    'tokenTypeId': tokenTypeId,
                    'contractId': contractId,
                },
            },
            ...Object.keys(queryParams)
                .map((key) => {
                return {
                    $match: {
                        'metadata.attributes': {
                            "$elemMatch": {
                                "name": key,
                                "value": queryParams[key]
                            }
                        },
                    }
                }
            })
        ]).exec()

        if (!res) {
            return []
        }

        return res.metadata.filter((t: any) => t.metaverseId === metaverseId)
    }

}