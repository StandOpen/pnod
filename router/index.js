var Express = require('express');
var fs = require('fs');
var db = require(U + 'mysql.js');

var router = module.exports = Express.Router(); 
router.get('/help', function (req, res) {
    res.end("help");
}); 

var _get = [
    '/index.html', 
    '/demo/index.html',
    '/note/index.html',
    '/about/index.html',
];
router.get(_get, function (req, res) {
    res.display(V + req.url);
}) 

router.get('/doc/index.html', function(req, res) {   
    var path = V + '/doc/file/';
    fs.readdir(path, function(err, file) {
        res.display(V + req.route.path, { file: file });
    });
}); 

 