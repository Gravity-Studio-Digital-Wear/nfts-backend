import {Body, JsonController, Post} from "routing-controllers";
import {MetaverseProvider} from "../schemas/metaverse-provider";
import * as crypto from 'crypto';
import {Service} from "typedi";

class MetaverseDTO {
    name: string;
}

function generateKey(size = 32, format = 'base64') {
    return crypto.randomBytes(size)
        .toString(format as any)
        .replace(/[^A-Za-z0-9]/g, "")
        .substring(0, 24)
}

@Service()
@JsonController('/metaverse')
export class MetaverseController {
    @Post('/')
    async create(@Body() { name }: MetaverseDTO): Promise<any> {
        const metaverse = await MetaverseProvider.findOne({
            name
        }).exec();

        if (!!metaverse) {
            throw new Error('Metaverse already exists')
        }

        const secret = generateKey();

        const createdMetaverse = await MetaverseProvider.create({
            name,
            secret
        });

        await createdMetaverse.save();

        return { secret, name };
    }


    generateAPISecret(): Promise<string> {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) =>{
                if (err) {
                    reject(err);
                    return;
                }

                resolve(buf.toString('base64url'))
            })
        })
    }

}