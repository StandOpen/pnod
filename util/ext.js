﻿var Express = require('express'); 
 
var router = module.exports = Express.Router();
 
 
var smtpTransport = require("nodemailer").createTransport(global.MAIL)
 
router.use(function (req, res, next) { 


    //显示模板
    res.display = function(str, args) {
        var a = args || [];
        a.tpl = function() { return str; };
        a.content = str;
        a.req = req;
        res.render(V + 'tpl.html', a);
    };
    //发送邮件
    res.sendMail = function(to,title, html) { 
        smtpTransport.sendMail({
            from    : 'sockpp<' + user + '>'
            , to      : '<' + to + '>'
            , subject : title
            , html    : html
        }, function(err, res) {
            console.log(err, res);
        });
    };



    next();
});
	 

router.get('/io', function (req, res) {

    res.write('<script>setTimeout("location=location",1000);</script><pre>');
    for (var n in io.nsps)
    {
        var ss = io.nsps[n].sockets;
        res.write('\n' + n);
        for (var i = 0; i < ss.length; i++)
        {
            res.write('\n> ' + ss[i].id);
        }
        res.write('\n');
    }
    res.end();


});
 