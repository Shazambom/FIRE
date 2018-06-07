const express = require('express');
const db = require('../database/database');
const router = express.Router();
let data = {};


/* GET home page. */

router.get('/', function(req, res, next) {
    res.render('profile', {data: null});
});





module.exports = router;