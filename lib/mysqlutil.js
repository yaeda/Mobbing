/*!
 * mysqlutil
 * Copyright(c) 2012 Shunsuke <qfoori@gmail.com>
 * MIT Licensed
 */


var MySQLUtil = (function () {

  function MySQLUtil() {
    this.isTransaction = false;
  };


  MySQLUtil.prototype._error   = function(conn) {
    console.log('error');
  };

  MySQLUtil.prototype.beginTransaction = function(conn, cb) {
    var self = this;
    var _cb = function(err) {
      if (err) {
        if (cb) {cb(err);}
        return;
      }
      self.isTransaction = true;
      cb();
    }
    conn.beginTransaction(_cb);
  };

  MySQLUtil.prototype.rollback = function(err, conn, cb) {
    var self = this;
    if (self.isTransaction === true) {
      self.isTransaction = false;
      conn.rollback(function() {
        conn.release();
        if (cb) {cb(err);}
      });
    } else {
      if (cb) {cb(err);}
    }
  };

  MySQLUtil.prototype.commit = function(conn, cb) {
    var self = this;
    
    if (self.isTransaction === true) {
      self.isTransaction = false;
      conn.commit(function(err) {
        if (err) {
          self._rollback(err, conn, cb);
          return;
        }
        conn.release();
        if (cb) {cb();}
      });
    } else {
      if (cb) {cb();}
    }
  };

  MySQLUtil.prototype.query = function(conn, query, options, cb) {
    if (!conn || !query || query.length === 0) {
      if (cb) {cb(new Error('invalid params to query'));}
      return;
    }

    var sql = query;
    var record;
    var values;
    var cbargs;
    if (options) {
      if (options.record) {
        record = options.record;
        values = record;
      }
      if (options.ph) {
        values = options.ph;
      }          
      if (options.cbargs) {
        cbargs = options.cbargs;
      }
      var limit;
      var offset;
      if (options.limit) {
        limit = options.limit;
        if (options.offset) {
          offset = options.offset;
        }
      }
      var orders;
      if (options.orders) {
        orders = options.orders;
        sql += ' ORDER BY ';
        for (var i = 0; i < orders.length; i++) {
          if (i > 0) {
            sql += ', ';
          }
          var order = orders[i];
          sql += order.key;
          if (order.sort) {
            sql += ' ' + order.sort;
          }
        }
      }
      if (limit) {
        sql += ' LIMIT ';
        if (offset) {
          sql += offset + ', ';
        }
        sql += limit;
      }
    }
    console.log(sql);
    
    conn.query(sql, values, function(err, rows, fields) {
      if (cb) {cb(err, rows, fields, cbargs);}
    });
    

  };

  
  return MySQLUtil;
})();

module.exports = MySQLUtil;
