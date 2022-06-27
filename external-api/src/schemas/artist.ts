import {model, Schema} from "mongoose";

const artistMetadataSchema = new Schema({
    alias: {type: String, required: true, unique: true},
    contracts: [{
        network: String,
        alias: { required: false, type: String },
        address: String,
        tokenTypeIds: [String]
    }]
});


export const Artist = model('Author', artistMetadataSchema);