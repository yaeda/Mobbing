/*
* Mapper for Event
*/

var Class   = require('./Event');
var ObjUtil = require('../lib/objectutil');

var EventMapper = {
  select: function(conn, records, options, cb) {
    records = ObjUtil.toArray(records);
    var sql   = 'SELECT id, name, state, starttime, Game_id FROM Event';
    var whsql = '';

    
  },
  insert: function(conn, records, options, cb) {
    if (!records || records.length === 0) {
      if (cb) {return cb(new Error('records is null'));}
    }
    var isConnect = false;
    if (options) {
      if (options.isConnect) {isConnect = options.isConnect;}
    }
    records = ObjUtil.toArray(records);
    var set   = 'id, name, state, starttime, Game_id';
    var val   = '?, ?, ?, ?, ?';
    var sql   = 'INSERT INTO Event(' + set + ') VALUES (' + val + ')';

  },
  update: function(conn, records, options, cb) {
    var isConnect = false;
    if (options) {
      if (options.isConnect) {isConnect = options.isConnect;}
    }
    records = ObjUtil.toArray(records);
    var set = ' :id_r :name_r :state_r :starttime_r :Game_id_r';
    var sql = 'UPDATE Event SET ' + set;

  },
  delete: function(conn, records, options, cb) {
    records = ObjUtil.toArray(records);
    var sql = 'DELETE FROM Event';
    var whsql = '';

  }
};

module.exports = EventMapper;

