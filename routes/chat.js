var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.query.username);
  res.render('chat', { title: 'Kitcat-rtc' });
});

module.exports = router;
