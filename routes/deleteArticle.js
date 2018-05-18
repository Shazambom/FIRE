var express = require('express');
var router = express.Router();
const db = require('../database/database');

/* GET home page. */

router.post('/', function(req, res, next) {
    db.deleteArticle(req.body["name"], req.sessionID, function (changed, err) {
        if (err) {
            console.log(err);
        } else if (changed) {
            res.send("Deleted successfully");
        } else {
            res.send("Unsuccessful deletion attempt");
        }
    })
});


module.exports = router;
