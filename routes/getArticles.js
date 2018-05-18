var express = require('express');
var router = express.Router();
const db = require('../database/database');

/* GET home page. */

router.get('/', function(req, res, next) {
    db.getAllArticles(function (articles) {
        res.render('blog', {articles: articles});
    });
});


module.exports = router;
