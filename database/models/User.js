var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    name: String,
    hash: String,
    salt: String,
    dataID: String,
    token: String,
    expiration: Date,
    username: String
});

module.exports = mongoose.model('Users', userSchema);
