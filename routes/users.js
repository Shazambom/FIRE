var express = require('express');
var router = express.Router();
const db = require('../database/database');

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(req.sessionID);
  db.checkToken(req.sessionID, function (valid, err) {
      if (err) {
        console.log(err);
      } else {
        if (valid) {
            res.send("Valid token");
        } else {
            res.send("Invalid token");
        }
      }
  })
});

module.exports = router;
