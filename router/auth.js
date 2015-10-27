var Express = require('express');
var fs = require('fs');
var db = require(U + 'mysql.js');
 
var router = module.exports = Express.Router();

 
function asset(req, str, __) {
    var vals = str.split(','); 
    for (var i = 0; i < vals.length; i++)
        if (!req[vals[i]]) __ = vals[i]; 
    if (__) {
        console.log('asset:' + __);
        return false;
    }
    return true;
}
var _get = [
    '/login.html', 
    '/reg.html', 
];
router.get(_get, function(req, res) {
    res.display(V + req.baseUrl + req.url);
})

router.post('/login.html', function (req, res ) {
    if (!asset(req,'body,session')) return res.end();
     
    db.table = 'dev';
    db.where = {
        username : req.body.email,
        password : ['= md5( ? )', req.body.password],
    };
    db.select(function (err, data, fields) { 
        if (err || data.length == 0)
        {
            res.render('goto', { msg: '用户名或密码错误', url: '/auth/login.html',delay:1000 }); 
        }
        else
        {
            db.table = 'dev';
            db.where.id = data[0].id;
            db.save({ login_time: [' = now()'] } );
            req.session['user'] = data[0];
            req.session.save();
            res.render('goto', { msg: '登陆成功,正在跳转', url: '/dev/', delay: 1 }); 
        }
        res.end();
    });
    
});
router.get('/logout.html', function(req,res) {
    if (!asset(req, 'session')) return res.end();
    delete req.session['user'];
    req.session.save();
    res.render('goto', { msg: '注销完成,正在跳转', url: '/', delay: 1 }); 
})

router.post('/reg.html', function (req, res) {
    if (!asset(req, 'body,session')) return res.end();

    var un = req.body.email;
    var pw = req.body.password;
    var cf = req.body.confirm;
    var time = Date.now();
    var ct = date('Y-m-d H:i:s',time);
    if (cf != pw) res.end("确认密码不匹配");
    
    new function N() {
        db.table = 'dev';
        db.where.username = un;
        db.where.valid = ['<> 1'];
        db.select(function(err, data) {
            if (err || data.length > 0)
            {
                res.render('goto', { msg: '用户名存在', url: '/auth/reg.html',delay:1000 });
            } 
            else
            { 
                next1();
            }
        });
    };
    function next1(){
        db.table = 'dev';
        var data = {
            username: un,
            password: ["=md5('" + pw + "')"],
            create_time: ["= '" + ct + "'"],
        };;
        db.add(data, function(err, data, fields) {
            if (err)
            {
                res.render('goto', { msg: '注册失败', url: '/auth/reg.html',delay:1000 });
            }
            else
            {
                next2(un);  
                req.session['user'] = { id: data.insertId , username: un  };
                req.session.save();
                res.render('goto', { msg: '注册成功', url: '/dev/', delay: 1 });
            }
        });
    }
    function next2(email){
        var href = "http://" + req.host + '/auth/v/' + time.toString(32);
        var path = V + 'public/tpl_mail.html';
        fs.readFile(path , function(err, text) {
            text = text.toString('utf-8').replace("{$email}", email).replace(/\{\$href\}/g, href);
            res.sendMail(email,'SOCKPP 注册成功', text);
        });  

    }

});


router.get('/v/:time', function(req, res) {
    var k = parseInt(req.params.time, 32); 
    db.table = 'dev';
    db.where.create_time = date('Y-m-d H:i:s', k); 
    db.save({ valid: '1' }, function(err, ref) {
        if (req.session && req.session.user)
        {
            db.table = 'dev';
            db.where.id = req.session.user.id;
            db.select(function(err, ref) {
                req.session.user = ref[0];
                req.session.save();
            });
        }

        res.render('goto', {url:'/', delay: 1 });
    });


});


