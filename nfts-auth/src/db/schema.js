const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    address: String,
    roles:              [String],
    name:               {type: String, default: ''},
    avatar:             {type: String, default: ''},
    email:              {type: String, default: ''},
    instagramLink:      {type: String, default: ''},
    facebookLink:       {type: String, default: ''},
    twitterLink:        {type: String, default: ''},
    tiktokLink:         {type: String, default: ''},
    avatarUrl:          {type: String, default: ''}
});


const User = mongoose.model('User', userSchema);

module.exports = {
    User
}