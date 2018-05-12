var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    name: String,
    hash: String,
    salt: String,
    dataID: String
});

module.exports = mongoose.model('Users', userSchema);
