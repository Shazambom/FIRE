var express = require('express');
var router = express.Router();
const db = require('../database/database');

/* GET home page. */

router.get('/', function(req, res, next) {
    db.getAllArticles(function (articles) {
        var json = {};
        articles.forEach(function (elem) {
            json[elem.name] = {
                body: elem.body,
                category: elem.category
            }
        });
        res.render('home', {posts :json});
    });
});


module.exports = router;
