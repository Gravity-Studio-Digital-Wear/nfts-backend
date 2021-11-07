const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    _id: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true, dropDups: true, default: '' },
    description: { type: String, required: true },
    priceUSD: { type: Number, required: true },
    rentPriceUSD: { type: Number, required: true },
    contractId: { type: String, required: true },
    tokenTypeId: { type: String, required: true },
    images: { type: [String], required: true },
    active: { type: Boolean, default: true }
}, {
    timestamps: true,    toJSON: {
        virtuals: true
    }
});

productSchema.virtual('rentProductId').get(function() {
    return `rent_${this._id}`
})

const wearTicketSchema = new mongoose.Schema({
    address: { type: String, required: true },
    productId: { type: String, required: true },
    status: { type: String, required: true },
    type: { type: String, required: true, default: 'buy' },
    sourceImageLinks: { type: [String]},
    resultImageLinks: { type: [String]},
    rejectComment: { type: String},
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
const WearTicket = mongoose.model('WearTicket', wearTicketSchema);

module.exports = {
    Product,
    WearTicket
}