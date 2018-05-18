var express = require('express');
var router = express.Router();
const db = require('../database/database');

/* GET home page. */

router.post('/', function(req, res, next) {
    db.storeArticle(req.body["article"], req.body["name"], req.body["category"], req.sessionID, function (submited, err) {
        if (err) {
            console.log(err);
        } else if (submited) {
            res.send("Submission successful");
        } else {
            res.send("Submission unsuccessful");
        }
    })
});


module.exports = router;
