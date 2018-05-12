var mongoose = require('mongoose');

var dataSchema = mongoose.Schema({
    assets: {}
});

module.exports = mongoose.model('Datas', dataSchema);
