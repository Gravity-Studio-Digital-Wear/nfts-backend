import "reflect-metadata";
import { createExpressServer, useContainer } from 'routing-controllers';
import { NFTController } from './controllers/NFTController';
import { connect } from 'mongoose';
import {MetaverseController} from "./controllers/MetaverseController";
import { Container } from 'typedi';

useContainer(Container);

(async function (){
    await connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DB}`)
    console.log(`Database connected`)

    const app = createExpressServer({
        controllers: [
            NFTController,
            MetaverseController
        ],
    });

    app.listen(3003);

    console.log('Server Started listen 3003')
})()

