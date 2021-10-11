const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, dropDups: true, default: '' },
    description: { type: String, required: true },
    priceUSD: { type: Number, required: true },
    contractId: { type: String, required: true },
    tokenTypeId: { type: String, required: true },
    images: { type: [String], required: true },
    active: { type: Boolean, default: true }
}, {
    timestamps: true
});

const wearTicketSchema = new mongoose.Schema({
    address: { type: String, required: true },
    productId: { type: String, required: true },
    status: { type: String, required: true },
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