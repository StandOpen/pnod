var mysql = require("mysql");
var pool = mysql.createPool(global.DB);
 
exports.query = function (sql, callback$args,cb) { 
    switch (typeof callback$args)
    {
        case 'object': var args = callback$args; break;
        case 'function':
        default:   cb = callback$args;   break;
    }
    pool.getConnection(function (err, conn) {
        if (err)
        {
            if (cb) cb(err, null, null);
        }
        else
        {
            var qcb = function (qerr, vals, fields) {
                //释放连接
                conn.release();
                //事件驱动回调
                if (cb) cb(qerr, vals, fields);
            }
            if (args) conn.query(sql, args, qcb);
            else conn.query(sql, qcb);
        }
    });
};

exports.post = function (data, cb) { 
    pool.getConnection(function (err, conn) {
        if (err)
        {
            if (cb) cb(err, null, null);
        }
    });
};
exports.init = function() { 
    this.table = '';
    this.where = {};
    this.order = '';
    this.join = null;
    this.field = null;
};
exports.init();
exports._sql = '';

function _parse_arr( arr, args, _split_ )
{
    var sql = '';
    for ( var i in arr )
    {
        if ( typeof arr[i] == 'object' )
        {
            sql += _split_ + i + ' ' + arr[i][0] + ' ';
            if ( arr[i][1] )
            {
                if ( arr[i][0].indexOf( '?' ) == -1 ) sql += ' ? ';
                args.push( arr[i][1] );
            }
        }
        else
        {
            sql += _split_ + i + ' = ? ';
            args.push( arr[i] );
        }
    }
    return sql;
};


exports._sql_where = function (args) {
    var sql = _parse_arr(this.where, args, 'and ');
    if (sql) this._sql += ' where ' + sql.substr(3);
};
exports._sql_set = function (data, args) { 
    var sql = _parse_arr(data, args, ', ');
    if (sql) this._sql += ' set ' + sql.substr(1);
};
exports._sql_field = function () {
    var str = '';
    switch (typeof this.field)
    {
        case 'string':
            this._sql += this.field;
            break;
        case 'array':
            for (var i in this.field)
                str += ', ' + this.field[i];
            this._sql += str.substr(1);
        default:
            this._sql += ' * ';

  }
};
exports._sql_join = function () {
    if (this.join)
    {
        this._sql += 'left join ' + this.join;
    }
}
exports._sql_order = function () {
    if (this.order)
    {
        this._sql += ' order by ' + this.order;
    }
}
 

exports.select = function (cb) {
    if (!this.table) return cb && cb('not table');

    var args = [];
    this._sql = 'select ';
    this._sql_field();
    this._sql += ' from ' + this.table + ' ';
    this._sql_join();
    this._sql_where(args);
    this._sql_order();
    this.query(this._sql, args, cb);
    this.init();
};

exports.save = function (data, cb) { 
    if (!data) return cb && cb('not data');
    if (!this.table) return cb && cb('not table');
    if (!this.where.id)
    {
        if (data['id'])
        {
            this.where.id = data.id;
            delete data.id
        }
        else if (this.where.length == 0)
        {
            return cb && cb('not where');
        }
    }

    var args = [];
    this._sql = 'update ' + this.table + ' '; 
    this._sql_set(data,args);
    this._sql_where(args);
    this.query(this._sql, args, cb);
    this.init();
};

exports.add = function (data, cb) {
    if (!data) return cb && cb('not data');
    if (!this.table) return cb && cb('not table');


    var args = [];
    this._sql = 'insert ' + this.table + ' ';
    this._sql_set(data,args);
    this.query(this._sql, args, cb);
    this.init();
};

exports.delete = function (cb) {
    if (!this.table) return cb && cb('not table');

    var args = [];
    this._sql = 'delete from ' + this.table;
    this._sql_where(args);
    this.query(this._sql, args, cb);
    this.init();
}
 
exports.query('show tables', function (err, data) { 
    if(err)console.log(('Mysql Connect Test ' + err));
});