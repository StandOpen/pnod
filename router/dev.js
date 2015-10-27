var Express = require('express');  
var db = require(U + 'mysql.js');

var router = module.exports = Express.Router();

router.use(function (req, res, next) {
   
    if (!req.session.user)  req.url = "/403.html"; 
    next();
});


router.get('/index.html', function (req, res, next) {
    res.end('<script>location="./room/index.html"</script>');
});

router.get('/settings.html', function (req, res, next) {
    req.url = '/modify.html', next();
}); 
router.get('/modify.html', function (req, res) {
    db.table = 'dev';
    db.where.id = req.session.user.id;
    db.select(function (err, data) {
        if (err || data.length != 1)
            res.write((err || {}).message + '<br>' + db._sql);
        else 
            res.display(V + req.baseUrl + '/modify.html', { info: data[0] });  
        res.end();
    });
});
router.post('/modify.html', function (req,res) {
    if (!req.body.password
    || !req.body.confirm
    || !req.session.user.id )
        return res.end(); //asset
    
    if (req.body.password != req.body.confirm)
        return res.render('goto', { message: '确认密码不相同',delay:1000 });

    db.table = 'dev';
    db.where.id = req.session.user.id;
    db.save({ password: req.body.password }, function (err) {
        if (err) return  res.end(); 
        res.render('goto', { message: '修改成功', delay: 1 });
    });

})

 

router.get('/room.html', function(req, res, next) {
    res.end('<script>location="./room/index.html"</script>'); 
});
router.get('/room/index.html', function(req, res, next) {
    req.url = '/room/list.html', next();
});
 
router.get('/room/list.html', function(req, res) {
    db.table = 'room';
    db.where.dev_id = req.session.user.id;
    db.select(function(err, data) { 
        for (var i = 0; i < data.length; i++)
        {
            try
            {
                data[i].urlkey = 'ws://' + req.headers.host + '/' + data[i].rkey;
                data[i].date = date('创建时间: Y-m-d H:i',data[i].create_time)
            }catch(e){}
        }
        res.display(V + req.baseUrl + '/room/list.html', { list: data });
    })
});
router.get('/room/create.html', function(req, res) { 
    res.display(V + req.baseUrl + '/room/create.html');
});

router.get('/room/:rkey/modify.html', function(req, res) {
    if (!req.params.rkey) return res.end();//asset
    
    db.table = 'room';
    db.where.rkey = req.params.rkey;
    db.field = '*, md5(id) `mid`';
    db.select(function(err, b, c) {
        if (err)
            res.write(err.message + '<br>' + db._sql);
        else
            res.display(V + req.baseUrl + '/room/modify.html', {
                info: b[0], 
            });
        res.end();
    });
});
router.get('/room/:rkey/delete.html', function(req, res) {
    if (!req.params.rkey) return res.end();//asset
    
    db.table = 'room';
    db.where.rkey = req.params.rkey;
    db.delete(function(err, data) {
        if (err) res.render('goto', { delay: 0 });
        else
        {
            res.render('goto', { msg: '删除成功', url: './list.html' });
        }
    });
});

router.post('/room/create.html', function(req, res) {
    if (!req.session.user 
        || !req.session.user.id 
        || !req.body.name 
        || !req.body.host)
        return res.end();

    var data = {
        dev_id: req.session.user.id,
        rkey: (Date.now() - 1000 * 3600 * 24 * 365 * 45.5).toString(36),
        name: req.body.name,
        host: req.body.host,
        create_time: ['= now()'],
    };
    
    db.table = 'room';
    db.add(data, function(err, b, c) {
        if (err)
            res.write(err.message + '<br>' + db._sql);
        else
            res.render('goto', {
                msg: 'success',
                url: './list.html',
                delay:1,
            })
        res.end();
    });
}); 
router.post('/room/:rkey/modify.html', function(req, res) {
    if (!req.body.name
        || !req.body.host
        || !req.body.mid
        || !req.params.rkey)
        return res.end(); //asset

    var data = { 
        name: req.body.name,
        host: req.body.host,
    }; 
    db.table = 'room';
    db.where.rkey = req.params.rkey;
    db.where['md5(id)'] = req.body.mid;
    db.save(data, function(err, b, c) {
        if (err)
            res.write(err.message + '<br>' + db._sql);
        else
            res.render('goto', {
                msg: 'success',
                url: req.baseUrl + '/room.html',
                delay:1,
            })
        res.end();
    });
});



