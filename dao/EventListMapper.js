/*
* Mapper for Event
*/

var Class   = require('./Event');
var Util    = require('../lib/queryutil');
var ObjUtil = require('../lib/objectutil');
var SQLUtil = require('../lib/mysqlutil');

var EventMapper = {

  select: function(pool, records, options, cb) {
    records = ObjUtil.toArray(records);
    var sql;
    var whsql;
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
    
    var sql   = 'SELECT id, Event.name, SelUser.name AS username, state, starttime, Game_id FROM Event'
    + ' LEFT JOIN (SELECT Event_id, User_id, name FROM Score'
    + ' INNER JOIN User ON Score.User_id = User.id) AS SelUser'
    + ' ON Event.id = SelUser.Event_id';
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
            console.log(err);
            sqlUtil.rollback(err, cb);
            return;
          }
          
          var _cb = function(err) {
            var entities;
            if (!err && rows && rows.length > 0) {
              entities = [];
              var events = {};
              for (var i = 0; i < rows.length; i++) {
                var ent = Class.create();
                var id = rows[i].id;
                ent.id        = rows[i].id;
                ent.name      = rows[i].name;
                ent.state     = rows[i].state;
                ent.starttime = rows[i].starttime;
                ent.Game_id   = rows[i].Game_id;
                var event;
                if (!events[id]) {
                  event = ent;
                  events[id] = event;
                } else {
                  event = events[id];
                }                
                var user;
                var username;
                username = rows[i].username;
                if (username) {
                  var users;
                  if (!event.users) {
                    event.users = [];
                  }
                  users = event.users;
                  user  = {name: username};
                  users.push(user);
                }
              }
              for (var item in events) {
                entities.push(events[item]);
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
    
  }
};

module.exports = EventMapper;

