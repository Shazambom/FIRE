var express = require('express');
var router = express.Router();
const db = require('../database/database');

/* GET home page. */

router.get('/', function(req, res, next) {
    db.checkAdmin(req.sessionID, req.headers["user-agent"], function (isAdmin, err) {
        if (err || !isAdmin) {
            res.status(404).send();
        } else {
            res.render('admin');
        }
    });

});


module.exports = router;