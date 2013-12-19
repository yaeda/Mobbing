/*
* Mapper for Event
*/

var Class   = require('./Event');
var Util    = require('../lib/queryutil');
var ObjUtil = require('../lib/objectutil');
var SQLUtil = require('../lib/mysqlutil');

var EventMapper = {
  count: function(pool, records, options, cb) {
    records = ObjUtil.toArray(records);
    var sql   = 'SELECT COUNT(*) AS num FROM Event';
    var whsql = '';
    var que;
    var args = {};
    if (options) {
      if (options.que) {que = options.que;}
    }
      
    whsql = Util.createQuery(Class, records, que, true, true);
    if (whsql) {
      sql += ' WHERE ' + whsql;
    }
    
    pool.getConnection(function(err, conn) {
      if (err) {cb(err);return;}
      if (!conn) {
        if (cb) {cb(new Error('failed to create connection'));}
        return;
      }
      
      var sqlUtil = new SQLUtil();
      var isTransaction = false;
      if (options && options.isTransaction && options.isTransaction === true) {
        isTransaction = true;
      }
            
      try {
        var _cbResult = function(err, rows, fields, args) {
          if (err) {
            sqlUtil.rollback(err, cb);
            return;
          }
          var num = 0;
          if (rows && rows.length > 0) {
            if (rows && rows.length > 0) {
              num = rows[0].num;
            }
          }
          
          var _cb = function(err) {
            cb(err, num);
          };
          sqlUtil.commit(conn, _cb);
        };
          
        var _cbQuery = function(err) {
          if (err) {
            sqlUtil.rollback(err, cb);
            return;
          }
          sqlUtil.query(conn, sql, args, _cbResult);
        };
          
        if (isTransaction === true) {
          sqlUtil.beginTransaction(conn, _cbQuery);
        } else {
          _cbQuery();
        }
      } catch (err) {
        sqlUtil.rollback(err, conn, cb);
      }
    });
    
  },
  select: function(pool, records, options, cb) {
    records = ObjUtil.toArray(records);
    var sql   = 'SELECT id, name, state, starttime, Game_id FROM Event';
    var whsql = '';
    var que;
    var limit;
    var offset;
    var args = {};
    if (options) {
      if (options.que) {que = options.que;}
      if (options.orders) {args.orders = options.orders;}
      if (options.limit) {limit = options.limit;}
      if (options.offset) {offset = options.offset;}
      if (options.args) {args.cbargs = options.args;}
      if (limit) {
        args.limit = limit;
        args.offset = offset;
      }
    }
    whsql = Util.createQuery(Class, records, que, true, true);
    if (whsql) {
      sql += ' WHERE ' + whsql;
    }
    
    pool.getConnection(function(err, conn) {
      if (err) {cb(err);return;}
      if (!conn) {
        if (cb) {cb(new Error('failed to create connection'));}
        return;
      }
      
      var sqlUtil = new SQLUtil();
      var isTransaction = false;
      if (options && options.isTransaction && options.isTransaction === true) {
        isTransaction = true;
      }
            
      try {
        var _cbResult = function(err, rows, fields, args) {
          if (err) {
            sqlUtil.rollback(err, cb);
            return;
          }
          
          var _cb = function(err) {
            var entities;
            if (!err && rows && rows.length > 0) {
              entities = new Array(rows.length);
              for (var i = 0; i < rows.length; i++) {
                var ent = Class.create();
                ent.id        = rows[i].id;
                ent.name      = rows[i].name;
                ent.state     = rows[i].state;
                ent.starttime = rows[i].starttime;
                ent.Game_id   = rows[i].Game_id;
                entities[i] = ent;
              }
            }
            cb(err, entities);
          };
          sqlUtil.commit(conn, _cb);
        };
          
        var _cbQuery = function(err) {
          if (err) {
            sqlUtil.rollback(err, cb);
            return;
          }
          sqlUtil.query(conn, sql, args, _cbResult);
        };
          
        if (isTransaction === true) {
          sqlUtil.beginTransaction(conn, _cbQuery);
        } else {
          _cbQuery();
        }
      } catch (err) {
        sqlUtil.rollback(err, conn, cb);
      }
    });
    
  },
  insert: function(pool, records, options, cb) {
    records = ObjUtil.toArray(records);
    if (!records || records.length === 0) {
      if (cb) {return cb(new Error('records is null'));}
    }
    var set   = 'id, name, state, starttime, Game_id';
    var val   = '?, ?, ?, ?, ?';
    var sql   = 'INSERT INTO Event(' + set + ') VALUES (' + val + ')';
    var queNum = 0;
    var recNum = records.length;
        
    
    pool.getConnection(function(err, conn) {
      if (err) {cb(err);return;}
      if (!conn) {
        if (cb) {cb(new Error('failed to create connection'));}
        return;
      }
            
      var sqlUtil = new SQLUtil();
      var isTransaction = false;
      if (options && options.isTransaction && options.isTransaction === true) {
        isTransaction = true;
      }
      
      try {
        var _err;
        var isErr = false;
        var _cbResult = function(err, rows, fields, args) {
          if (err) {
            if (isErr === false) {
              isErr = true;
              _err  = err;
            }
          } else {
            if (args && args.index !== null && args.index !== undefined) {
              var record = records[args.index];
              var aikey = Class.getAI();
              if (aikey) {
                record[aikey] = rows.insertId;
              }
            }
          }
          queNum ++;
          if (queNum === recNum) {
            var _cb = function(err) {
              if (cb) {cb(err, records);}
            };
            if (isErr === false) {
              sqlUtil.commit(conn, _cb);
            } else {
              sqlUtil.rollback(_err, cb);
            }
          }
        };
                  
        var _cbQuery = function(err) {
          if (err) {
            sqlUtil.rollback(err, cb);
            return;
          }
          for (var i = 0; i < records.length; i++) {
            var record = records[i];
            // update undefined with default value
            for (var field in record) {
              if (typeof field === 'function') {
                continue;
              }
              if (record[field] === undefined) {
                record[field] = Class.getDefault(field);
              }
            }
            var args = {record:record, cbargs:{index: i}};
            var query = sql;
            // set escaping query values
            var ph = [];
            ph.push(record.id);
            ph.push(record.name);
            ph.push(record.state);
            ph.push(record.starttime);
            ph.push(record.Game_id);
            args.ph = ph;
            sqlUtil.query(conn, query, args, _cbResult);
          }
        };
        
        if (isTransaction === true) {
          sqlUtil.beginTransaction(conn, _cbQuery);
        } else {
          _cbQuery();
        }
      } catch (err) {
        sqlUtil.rollback(err, conn, cb);
      }
    });
    
    
  },
  update: function(pool, records, options, cb) {
    records = ObjUtil.toArray(records);
    var set = ' :id_r :name_r :state_r :starttime_r :Game_id_r';
    var sql = 'UPDATE Event SET ' + set;
    var queNum = 0;
    var recNum = records.length;
    var que;
    if (options) {
      if (options.que) {que = options.que;}
    }
      
    pool.getConnection(function(err, conn) {
      if (err) {cb(err);return;}
      if (!conn) {
        if (cb) {cb(new Error('failed to create connection'));}
        return;
      }
            
      var sqlUtil = new SQLUtil();
      var isTransaction = false;
      if (options && options.isTransaction && options.isTransaction === true) {
        isTransaction = true;
      }
      
      try {
        var _err;
        var isErr = false;
        var _cbResult = function(err, rows, fields, args) {
          if (err) {
            if (isErr === false) {
              isErr = true;
              _err = err;
            }
          }
          queNum ++;
          if (queNum === recNum) {
            var _cb = function(err) {
              if (cb) {cb(err, records);}
            };
            if (isErr === false) {
              sqlUtil.commit(conn, _cb);
            } else {
              sqlUtil.rollback(_err, cb);
            }
          }
        };
        
        
        var _cbQuery = function(err) {
          if (err) {
            sqlUtil.rollback(err, cb);
            return;
          }
                    
          for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var query  = sql;
            var whsql  = '';
            var queNum = 0;
            var args = {record:record, cbargs:{index: i}};
            var ph = [];
            var useNum = 0;
            var repVal = '';
            repVal = '';
            if (record.id !== undefined) {
              if (useNum > 0) {repVal += ', ';}
              repVal += 'id = ?';
              ph.push(record.id);
              useNum ++;
            }
            query = query.replace(/:id_r/g, repVal);
            repVal = '';
            if (record.name !== undefined) {
              if (useNum > 0) {repVal += ', ';}
              repVal += 'name = ?';
              ph.push(record.name);
              useNum ++;
            }
            query = query.replace(/:name_r/g, repVal);
            repVal = '';
            if (record.state !== undefined) {
              if (useNum > 0) {repVal += ', ';}
              repVal += 'state = ?';
              ph.push(record.state);
              useNum ++;
            }
            query = query.replace(/:state_r/g, repVal);
            repVal = '';
            if (record.starttime !== undefined) {
              if (useNum > 0) {repVal += ', ';}
              repVal += 'starttime = ?';
              ph.push(record.starttime);
              useNum ++;
            }
            query = query.replace(/:starttime_r/g, repVal);
            repVal = '';
            if (record.Game_id !== undefined) {
              if (useNum > 0) {repVal += ', ';}
              repVal += 'Game_id = ?';
              ph.push(record.Game_id);
              useNum ++;
            }
            query = query.replace(/:Game_id_r/g, repVal);
            args.ph = ph;
                            
            whsql = Util.createQuery(Class, record, que);
            if (!whsql || whsql.length === 0) {
              cb();
              return;
            } else {
              query += ' WHERE ' + whsql;
            }
            sqlUtil.query(conn, query, args, _cbResult);
          }
        };
        
        if (isTransaction === true) {
          sqlUtil.beginTransaction(conn, _cbQuery);
        } else {
          _cbQuery();
        }
      } catch (err) {
        sqlUtil.rollback(err, conn, cb);
      }
    });
      
  },
  delete: function(pool, records, options, cb) {
    records = ObjUtil.toArray(records);
    var sql = 'DELETE FROM Event';
    var whsql = '';
    var que;
    if (options) {
      if (options.que) {que = options.que;}
    }
    whsql = Util.createQuery(Class, records, que);
    // prohibit to delete all column.
    // if delete all column, set '1' to que variable.
    if (!whsql || whsql.length === 0) {
      cb();
      return;
    } else {
      sql += ' WHERE ' + whsql;
    }
       
    pool.getConnection(function(err, conn) {
      if (err) {cb(err);return;}
      if (!conn) {
        if (cb) {cb(new Error('failed to create connection'));}
        return;
      }
            
      var sqlUtil = new SQLUtil();
      var isTransaction = false;
      if (options && options.isTransaction && options.isTransaction === true) {
        isTransaction = true;
      }
      
      try {
        var _cbResult = function(err, rows, fields, args) {
          if (err) {
            sqlUtil.rollback(err, cb);
            return;
          }
          var _cb = function(err) {
            if (cb) {cb(err, records);}
          };
          sqlUtil.commit(conn, _cb);
          
          if (cb) {cb(err, records);}
        };
                  
        var _cbQuery = function(err) {
          if (err) {
            sqlUtil.rollback(err, cb);
            return;
          }
          sqlUtil.query(conn, sql, null, _cbResult);
        };
                
        if (isTransaction === true) {
          sqlUtil.beginTransaction(conn, _cbQuery);
        } else {
          _cbQuery();
        }
      } catch (err) {
        sqlUtil.rollback(err, conn, cb);
      }
    });
    
  }
};

module.exports = EventMapper;

