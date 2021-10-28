const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    _id: { type: String, required: true, unique: true },
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

const updateStatusSchema = new mongoose.Schema({
    lastUpdated: { type: Date, required: true }
});

const cartItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    priceId: { type: String, required: true },
    quantity: { type: String, required: true }
});

const checkoutSchema = new mongoose.Schema({
    _id: String,
    paymentIntent: { type: String, required: true, unique: true },
    cart: [cartItemSchema],
    accountId: { type: String, required: true },
    status: { type: String, required: true },
    fulfillment: { type: [String] },
    fulfillmentError: { type: String }
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

const blockNumberSchema = new mongoose.Schema({
    _id: {type: String},
    lastBlock: { type: Number, required: true }
}, {
    timestamps: true
});

const logSchema = new mongoose.Schema({
    _id: {type: String},
    type: { type: String, required: true },
    contractId: { type: String, required: true },
    tokenTypeId: { type: String, required: true },
    recipient: { type: String, required: true },
    sender: { type: String, required: true },
    sender: { type: String, required: true },
    blockNumber: {type: Number, required: true},
    transactionHash: {type: String, required: true},
    amount: {type: Number, required: true},
    status: {type: String, required: true},
    fulfillment: {type: [String]},
    fulfillmentError: {type: String},
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
const UpdateStatus = mongoose.model('UpdateStatus', updateStatusSchema);
const Checkout = mongoose.model('Checkout', checkoutSchema);
const WearTicket = mongoose.model('WearTicket', wearTicketSchema);
const BlockNumber = mongoose.model('BlockNumber', blockNumberSchema);
const Log = mongoose.model('Log', logSchema);

module.exports = {
    Product,
    UpdateStatus,
    Checkout,
    WearTicket,
    BlockNumber,
    Log
}