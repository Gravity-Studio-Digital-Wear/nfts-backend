import {Service} from "typedi";
import {Body, Get, JsonController, Param, Post} from "routing-controllers";
import {Contract} from "../web3/contract";
import {Artist} from "../schemas/artist";


import {IsArray, IsIn, IsOptional, IsString, ValidateNested} from 'class-validator'
import {Type} from "class-transformer";

class ContractInfoDto {
    @IsString()
    address: string;

    @IsString()
    @IsIn(['matic'])
    network: string;

    @IsString()
    @IsOptional()
    alias: string;

    @IsArray()
    tokenTypeIds: string[];
}

class ArtistDto {
    @IsString()
    alias: string;

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => ContractInfoDto)
    contracts: ContractInfoDto[]
}


@Service()
@JsonController('/registry')
export class ADRRegistryController {
    constructor(private contract: Contract) {
    }

    @Post('/alias')
    async createAlias(@Body() dto: ArtistDto): Promise<any> {
        const artist = await Artist.create({
            alias: dto.alias,
            contracts: dto.contracts
        });

        console.log(artist)
        return artist.toObject();
    }

    @Get('/:registryId/address/:address/assets')
    async getAssets(
        @Param('registryId') registryId: string,
        @Param('address') address: string,
    ) {
        const artist = await Artist.findOne({
            alias: registryId,
        }).exec();

        const res = await Promise.all(
            artist.contracts.map((contract: any) => {
                return this.contract.getAddressSupply(contract.address, address, contract.tokenTypeIds)
            })
        )

        const assets = [
            ...artist.contracts
                .map((contract: any, cI: number) => {
                    return contract.tokenTypeIds.map(
                        (tokenTypeId: string, tI: number) => {
                            return {
                                id: `${contract.address}:${tokenTypeId}`,
                                amount: res[cI][tI].toNumber(),
                                urn: {
                                    decentraland: `urn:decentraland:${contract.network}:collections-thirdparty:${artist.alias}:${contract.address}:${tokenTypeId}`
                                }
                            }
                        }
                    );
                })
        ].flatMap(x => x)

        return {
            address: address,
            assets: assets,
            total: assets.length,
            page: 1,
            next: false
        };
    }

    @Get('/:registryId/address/:address/assets/:id')
    async getAssetById(
        @Param('registryId') registryId: string,
        @Param('address') address: string,
        @Param('id') id: string,
    ) {
        const artist = await Artist.findOne({
            alias: registryId,
        }).exec();

        const [contractAddr, tokenTypeId] = id.split(':');

        const contract = artist.contracts.find((contract: any) => contract.address === contractAddr && contract.tokenTypeIds.includes(tokenTypeId))

        if (!contract) {
            return null
        }

        const res = await this.contract.getAddressSupply(contractAddr, address, [tokenTypeId as any])

        return {
            id: `${contract.address}:${tokenTypeId}`,
            amount: res[0].toNumber(),
            urn: {
                decentraland: `urn:decentraland:${contract.network}:collections-thirdparty:${artist.alias}:${contract.address}:${tokenTypeId}`
            }
        }
    }
}