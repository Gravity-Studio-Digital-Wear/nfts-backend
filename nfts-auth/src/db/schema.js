const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    address: String,
    name: String,
    avatar: String,
    email: String,
    instagramLink: String,
    facebookLink: String,
    twitterLink: String,
    tiktokLink: String,
    avatarUrl: String
});


const User = mongoose.model('User', userSchema);

module.exports = {
    User
}