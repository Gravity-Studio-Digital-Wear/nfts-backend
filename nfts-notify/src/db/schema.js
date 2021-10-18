const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    _id: { type: String, required: true, unique: true },
    messageTemplate: { type: String, required: true, unique: true, dropDups: true, default: '' },
    description: { type: String, required: true }
}, {
    timestamps: true
});

const Template = mongoose.model('Template', templateSchema);

module.exports = {
    Template
}