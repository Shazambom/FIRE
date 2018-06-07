var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    name: String,
    hash: String,
    salt: String,
    data: String,
    token: String,
    expiration: Date,
    username: String,
    isAdmin: Boolean,
    htmlHead: String
});

module.exports = mongoose.model('Users', userSchema);
