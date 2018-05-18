var mongoose = require('mongoose');

var articleSchema = mongoose.Schema({
    name: String,
    body: String,
    category: String,
    date: Date
});

module.exports = mongoose.model('Articles', articleSchema);
