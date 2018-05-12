var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.sendFile('/Users/ian/WebstormProjects/FIRE/bin/login.html');
});


module.exports = router;
