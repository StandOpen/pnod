var Express = require('express');
var fs = require('fs');
 
var router = module.exports = Express.Router();

var _get = [
    '/index.html',  
];
router.get(_get, function(req, res) {
    res.display(V + req.baseUrl + req.url);
})


router.use(function (req, res, next) {
    if (!req.session.user || req.session.user.username.indexOf('admin') == -1)
        req.url = "/403.html";
    next();
});


router.get('/doc/index.html', function(req, res) {
    var path =  req.app.get('views') + '/doc/file/';
    fs.readdir(path, function(err,file) { 
        res.render('.' + req.baseUrl + req.route.path, { file: file });
    });
});



function nfield(name){
    return (name||'').match(/[^\/\\\.]+\.html/);
}


router.get('/doc/edit.html', function(req, res) {
    var n = nfield(req.query.file);
    if (!n) return res.render('goto', { msg: '非法参数', url: './index.html' });//asset

    var path = req.app.get('views') + '/doc/file/';
    fs.readFile(path + n, function(err, text) {
        res.render('.' + req.baseUrl + req.route.path, {file:n, text: text }); 
    });
});
router.post('/doc/edit.html', function(req, res) {
    var n = nfield( req.body.file);
    if (!n) return res.render('goto', { msg: '非法参数' , url: './index.html'}); //asset
    

    var path = req.app.get('views') + '/doc/file/';
    var data = req.body.content;
    fs.writeFile(path + n,data, function(err, text) {
        res.render('goto', { msg:'修改成功',url:'./index.html' });
    });
});