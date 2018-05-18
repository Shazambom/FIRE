var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res, next) {
    /*
    db.getCategoryArticles('home', function (articles) {
        res.render('main', {
            articles: articles
        });
    });*/
    res.render('home');

});


module.exports = router;
