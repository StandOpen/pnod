var Express = require('express');
var db = require(U + 'mysql.js');

var router = module.exports = Express.Router();


router.get('/cc', function (req, res) {
    req.sessionStore.clear();
})
router.get('/test/index.html', function (req, res) {
    res.render('.' + req.originalUrl, { host: req.headers.host });
});