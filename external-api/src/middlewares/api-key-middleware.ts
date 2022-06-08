import {ExpressMiddlewareInterface} from "routing-controllers";
import {MetaverseProvider} from "../schemas/metaverse-provider";
import {Service} from "typedi";


@Service()
export class ApiKeyMiddleware implements ExpressMiddlewareInterface {
    async use(request: any, response: any, next?: (err?: any) => any): Promise<any> {
        const apikey = request.headers['api-key'];

        if (!apikey) {
            throw new Error('api key not provided');
        }

        const metaverse = await MetaverseProvider.findOne({
            secret: apikey
        }).exec();

        if (!metaverse) {
            throw new Error('api key not valid');
        }

        request.__metaverse = metaverse.name;

        next();
    }
}