import { Schema, model } from 'mongoose';

const productMetadataSchema = new Schema({
    metaverseId: {type: String, required: true},
    previewImage: {type: String, required: true},
    modelUrl: {type: String, required: true},
    platform: {type: String, required: true},
    modelParams:[{
        name: String,
        value: String
    }],
    attributes: [{
        name: String,
        value: String
    }]
})

const productSchema = new Schema({
    // _id: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true, dropDups: true, default: '' },
    description: { type: String, required: true },
    priceUSD: { type: Number, required: true },
    rentPriceUSD: { type: Number, required: true },
    contractId: { type: String, required: true },
    tokenTypeId: { type: String, required: true },
    images: { type: [String], required: true },
    active: { type: Boolean, default: true },
    metadata: [productMetadataSchema]
}, {
    timestamps: true,    toJSON: {
        virtuals: true
    }
});

export const Product = model('Product', productSchema)
export const ProductMetadata = model('ProductMetadata', productMetadataSchema)
