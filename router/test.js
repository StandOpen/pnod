var Express = require('express');
var db = require(U + 'mysql.js');

var router = module.exports = Express.Router();

router.use(function(req, res, next) {
    if (!req.session.user || req.session.user.username.indexOf('admin') == -1)
        req.url = "/403.html";
    next();
});


router.get('/', function (req, res) {
    
    db.query('select * from user', function (err, data, fields) {

        if (err)
        {
            console.log(err);
        }
        else
        { 
            console.log(data);
        }

        res.end("help");
    });
});

router.get('/sess', function (req, res) {

    if (!req.session.v) req.session.v = 0;

    req.session.v++;

    console.log(req.session.v);
    res.end();
});

router.get('/st', function T(req,res) { 
    switch (T.i = (T.i || 0) + 1)
    {
        case 1:
            setTimeout(T, 1000, [1,2]);
            break;
        case 2:

            setTimeout(T, 2000, [3]);

            break;
        case 3:

            setTimeout(T, 1000, ['sdegeg']);

            break;
        case 4:

            setTimeout(T, 2000,[4,4,4,4]);

            break;
        default:
            req.end();
            break;
    }

})
 
function T() {

    new function next() { 
        hash("user", next1);
    }
    function next1(A) { 
        hash("pass", next2);
    };
    function next2(ar,fef,fe) { 
        hash("config", next2);
    };
    function next3() { 
        hash("address", next2);
    }; 
}

function T() {
    switch (switch_on)
    {
        default:

    }
    hash("user", function (A) {
        T();
    });
    hash("user", T); 
    hash("user", T);
    hash("user", T);
}
function Tas(iswait, next) { 
    if (iswait && next) iswait.ok = next;
    else
    {
        return function next() {
            next.ok();
        }
    }
}
Task.Wait = function (iswait, next) {
    if (iswait)
    {

    }
    else
    {
        next();
    }
};
function Task() {
     
    this.yield = function () {

    }

}


function c() { 
    Task.Wait(d(), function () {

    });
}

function d() {

    if (true)
    {
        var t = new Task();
        d(function () {
            next();
        });
        return t.yield;
    }
    return false;
}
