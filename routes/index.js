var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.get('/copy', function(req, res) {
  res.render('copy');
});

module.exports = router;
