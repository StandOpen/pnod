var db = require(U + 'mysql.js');

module.exports = function T(io,server) {
    if (!(this instanceof T))  return new T(io,server);  
    
    //WebSocket 请求接入 Socket.io 转换
    var _upgrade = server._events.upgrade;
    server._events.upgrade = function (req, res,head) {
        //第一次请求 如果是 websocket
        if (!req.url.match(/\/[0-9a-f]{32}/)) { 
            return _upgrade.call(this, req, res, head);  
        }
        //获取房间号（namespace
        var room = req._room = req.url;
        req.url = '/socket.io/?EIO=3&transport=websocket';//转换接入请求地址  
         
        verify(room, req, function (err, data) {
            if (err) 
                req.url = ''; 
            else 
                if (!io.nsps[room]) newRoom(room, data); //创建房间
        
            _upgrade.call(this, req, res, head);
        });

    };

    //重写 输入 输出
    var _onWebSocket = io.eio.onWebSocket;
    io.eio.onWebSocket = function (req, websocket) {
        var room = req._room;
        if (room) {
            //重写输入 补上mait的 状态 参数 房间号 
            var _ontext = websocket._receiver.ontext;
            websocket._receiver.ontext = function (data, flags) {
                data = '42' + room + ',' + data; //42状态码？
                _ontext.apply(this, arguments);
               // websocket.emit('message', data, flags);
            }

            //重写输出 删除mait的 状态 参数 房间号
            var _send = websocket.send;
            websocket.send = function (s, next) {
                if (s.substr(0, 2) == '42') {
                    s = s.substr(s.indexOf(',') + 1);
                    _send.call(this, s, next)
                }
                next();
            };


        }
        _onWebSocket.apply(this, arguments);
    }; 

    //第一次连接成功后
    io.on("connect", function (socket) {

        //添加新socketio连接 到nsps集合
        var _connect = socket.client.connect;
        socket.client.connect = function (name) {//客户端返回房间号码 
            verify(name, req, function (err, data) {
                if (err) return; 
                if (!io.nsps[name])  newRoom(name, data); //创建房间
                add_nsps(name, data);
            }); 
        }; 
        //将websocket的连接(之前已经验证)添加 到nsps集合
        var req = socket.client.request;
        if (req._room) add_nsps(req._room, req.data);

        //进入房间 
        function add_nsps(name) {
            _connect.call(socket.client, name);
        }

    });

    //验证房间 是否允许进入 （允许就回调
    function verify(room, req, next) {
        if (!room) return err();;//asset
         
        function err(msg) {
            console.error('验证房间失败:'+(msg||''));
            next("error", null);
        }
        function vv(data) {
            if (!data.host) return;//asset

            var hs = data.host.split('\n');
            var url = (req.headers.origin || req.headers.referer || 'null');// + req.url);
            for (var i = 0; i < hs.length; i++)
                if (url.indexOf(hs[i].trim()) != -1)
                    return next(null,data);
            err(url+'\n'+data.host+'\n');
        } 
        //有就直接验证 没有就查数据再验证
        if (io.nsps[room])
            vv(io.nsps[room].info);
        else
        { 
            db.table = 'room';
            db.where.rkey = room.substr(1);
            db.select(function (err, data) {
                if (err) return console.log(err.message + '\n' + db._sql);
                if (data.length) vv(data[0]);
                else err('没有找到房间');
            }); 
        }  
    };

    function rnd_obj(obj) {
        var num = 0, i = 0;;
        for (var i in obj) num++;
        if (num == 0) return;

        for (var i in obj)
            if (i++ == num)
                return obj[i];
    }
    function rnd_arr(arr) {
        return arr[parseInt(Math.random() * arr.length)];
    }
    //创建新房间
    function newRoom(name, data) {
        console.log('创建新房间')
        var nf = io.of(name);
        nf.info = data;
        nf.on('connection', function (socket) {
            console.log('进入房间!! ' + name);
            var _onevent = socket.onevent;
            socket.onevent = function (packet) {
                var s = packet.data; 
                var ag = s[0].match(/([^@]+)(@.+)?/);
                s[0] = ag[1];//提取用户后重写消息名
                if (!ag[2])
                    nf.emit.apply(nf, s);//广播
                else if (ag[2] == '@server') 
                    _onevent.call(socket, packet);//服务器自己接收 
                else if (ag[2] == '@master')
                    nf.master.emit.apply(nf.master, s);//发送到主机
                else if(ag[2]=='@other')
                    socket.broadcast.emit.apply(socket.broadcast, s); //发送给其他人
                else 
                {
                    var to = nf.to(ag[2].substr(1));
                    if (to) to.emit.apply(to, s);//发送到指定用户或用户组
                }  
            };
            socket.on('disconnect', function () {
                console.log('离开房间!! ' + name);
                if (io.nsps[name].sockets.length == 0)
                {
                    delete io.nsps[name];
                    console.log('关闭房间!! ' + name);
                    return;
                }
            });


            /////////////// 服务器逻辑 //////////////////          

            //为第一个客户标记为主机
            if (nf.master == null)
            {
                nf.master = socket;
                console.log('分配主机为：', nf.master.id);
            }
            //登入登出事件
            echo('CONN_ENTER', socket.id);
            echo('CONN_COUNT', nf.sockets.length); 
            socket.on('disconnect', function () {
                echo('CONN_COUNT', nf.sockets.length);
                echo('CONN_EXIT', socket.id);
                if (!io.nsps[name]) return;
                //自动重新分配主机
                if (socket == nf.master)
                {
                    nf.master = rnd_arr(nf.sockets);
                    if (nf.master)
                        console.log('重新分配主机：', nf.master.id);
                    else
                        console.log('分配主机失败');
                }
            });
            
            //一次性回调
            socket.on('init', function (cb$name) {
                ccback(cb$name, socket.id);//自己的客户端ID 
            });
            socket.on('data', function (val, cb$name) {
                switch (val)
                {
                    case 'CONN_CID': ccback(cb$name, socket.cid); break;
                    case 'CONN_COUNT': ccback(cb$name, nf.sockets.length); break;
                    case 'CONN_TIME': ccback(Date.now()); break;
                    default: 
                } 
            });  
            //消息回调
            socket.echo = {};
            socket.on('bind', function (room, ename) {
                socket.join(room);
                socket.echo[room] = ename;//重写回调
            });

            //客户端分组
            socket.on('join', function(room) {
                socket.join(room); 
            });
            socket.on('leave', function(room) {
                socket.leaver(room); 
            });
            socket.on('find', function (room, func) {
                var ls = [];
                var cs = nf.adapter.rooms[room];
                if (cs) for (var id in cs) ls.push(id);
                ccback(func, ls);
            });
            
            function ccback(cb$name, val) {
                if (cb$name)
                {
                    if (typeof cb$name == 'function') cb$name(val);
                    else socket.emit(cb$name, val);
                }
            }
            function echo(key, val) {
                var cs = nf.adapter.rooms[key];
                if (cs) for (var id in cs)
                {
                    var to = nf.connected[id];
                    if (to && to.echo && to.echo[key]) to.emit(to.echo[key], val);
                }
            }
        }); 
    }

    
};