var mongoose = require('mongoose');

var tokenSchema = mongoose.Schema({
    id: String,
    expiration: Date,
    user: {}
});

module.exports = mongoose.model('Tokens', tokenSchema);
