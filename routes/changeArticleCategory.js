var express = require('express');
var router = express.Router();
const db = require('../database/database');

/* GET home page. */

router.post('/', function(req, res, next) {
    db.changeArticleCategory(req.body["name"], req.body["category"], req.sessionID, function (changed, err) {
        if (err) {
            console.log(err);
        } else if (changed) {
            res.send("Category successful changed");
        } else {
            res.send("Change unsuccessful");
        }
    })
});


module.exports = router;
