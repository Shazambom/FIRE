var express = require('express');
var router = express.Router();
const db = require('../database/database');

/* GET home page. */

router.get('/', function(req, res, next) {
    db.getCategoryArticles('stock', function (articles) {
        const json = {};
        articles.forEach(function (elem) {
            json[elem.name] = {
                body: elem.body,
                category: elem.category
            }
        });
        res.render('stocks', {posts :json});
    });
    //res.render('stocks');
});


module.exports = router;