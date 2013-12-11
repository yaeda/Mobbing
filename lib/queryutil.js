//
// Util
//

var objectutil = require('./objectutil');

Util = {
  getValidParameter: function(entity, params) {
    if (!entity || !params) {
      return;
    }
    var validParams = {};
    for (var field in params) {
      // check existence of field
      var isExist = entity.isExist(field);
      if (isExist !== true) {
        continue;
      }
      if (!entity.useEscape(field)) {
        var isNumber = true;
        if (objectutil.isArray(params[field]) === true) {
          for (var i = 0; i < params[field].length; i++) {
            if (isNaN(params[field][i]) === true) {
              isNumber = false;
              break;
            }
          }
        } else {
          if (isNaN(params[field]) === true) {
            isNumber = false;
          }
        }
        if (isNumber === false) {
          continue;
        }
      }
      validParams[field] = params[field];
    }
    return validParams;
  },

  escapeValue : function(value, escape) {
    var esvalue = '';
    if (escape === true) {
      esvalue = '\'' + value + '\'';
    } else {
      esvalue = value;
    }
    return esvalue;
  },
  whereString : function(field, values, escape, header, isBit) {
    var sql = '';
    var field  = field;
    var values = values;
    if (header) {
      field = header + '.' + field;
    }
    if (isBit) {
      var bitval = 0;      
      for (var i = 0; i < values.length; i++) {
        bitval = bitval | parseInt(values[i]);
      }
      values = bitval;
    }
    
    // check array or not
    if (typeof(values) === 'object') {
      var isBoth = false;
      var isNull = false;
      var isKey  = false;
      var keynum = 0;
      for (var i = 0; i < values.length; i++) {
        if (values[i] === null) {
          isNull = true;
        } else {
          isKey  = true;
        }
        if (isNull && isKey) {
          isBoth = true;
          break;
        }
      }
      if (isBoth) {
        sql += '(';
      }
      if (isNull) {
        sql += field + ' IS NULL';
      }
      if (isBoth) {
        sql += ' OR ';
      }
      if (isKey) {
        sql = sql + field + ' IN (';
        for (i = 0; i < values.length; i++) {
          if (!values[i]) {
            continue;
          }
          if (keynum > 0) {
            sql = sql + ', ';
          }
          sql = sql + Util.escapeValue(values[i], escape);
          keynum ++;
        }
        sql = sql + ')';
      }
      if (isBoth) {
        sql += ')';
      }
    } else {
      if (values === null) {
        sql = sql + field + ' IS NULL ';
      } else {
        if (!isBit) {
          sql = sql + field + ' = ' + Util.escapeValue(values, escape);
        } else {
          sql = sql + ' (' + field + ' & ' + values + ') > 0';
        }
      }
    }
    return sql;
  },
  connectWord : function(front, back, sep) {
    //return Util.stringify([front, back], sep);
    var str = '';
    if (front) {
      str = front;
    }
    if (!back || back.length === 0) {
      return str;
    }
    if (str && str.length > 0) {
      str += sep + back;
    } else {
      str  = back;
    }
    return str;
  },
  connectWords: function(key, values, eq, sep, type) {
    // type : 1 ... int
    if (!key || !values) {
      return;
    }
    // check values
    if (type === 1) {
      for (var i = 0; i < values.length; i++) {
        values[i] = parseInt(values[i]);
      }
    }

    var obj = {};
    obj[key] = values;
    return Util.stringify(obj, sep);
  },
  stringify: function(obj, sep, eq, logic) {
    var sep = sep || ', ';
    var eq  = eq || ' = ';
    var logic = logic || ' AND ';
    if (objectutil.isObject(obj) === false) {
      return;
    }

    var _stringify = function(key, value, sep, eq) {
      var sep = sep || ', '
      var eq  = eq || ' = ';
      var val = '';
      var end = '';
      if (objectutil.isArray(value)) {
        if (value.length === 0) {
          return;
        }
        eq = ' IN (';
        end = ')';
        for (var i = 0; i < value.length; i++) {
          if (i > 0) {
            val += sep;
          }
          val += value[i];
        }
      } else {
        val = value;
      }
      return key + eq + val + end;
    };


    var isQue = false;
    var que = '';
    for (var field in obj) {
      if (isQue === true) {
        que += logic;
      }
      que += _stringify(field, obj[field], sep);
    }

    return que;
  },
  connectSearchQuery : function(queries, isOr) {
    var query = '';
    var conn = ' AND ';
    if (isOr && isOr === true) {
      conn = ' OR ';
    }
    if (queries) {
      for (var i = 0; i < queries.length; i++) {
        var que = queries[i];
        if (!que || que.length === 0) {
          continue;
        }
        query = Util.connectWord(query, que, conn);
      }
    }
    return query;
  },
  createQuery : function(entity, records, query, useAll, allowNull, header) {
    if (!query) {
      if (!entity || !records || records.length === 0) {
        return;
      }
    }
    var useNull = false;
    if (allowNull && allowNull === true) {
      useNull = true;
    }

    var isBitFunc = false;
    if (entity.isBitField) {
      isBitFunc = true;
    }
    
    var recquery;
    var queries = [];
    if (records) {
      var recordAry;
      if (records instanceof Array) {
        recordAry = records;
      } else {
        recordAry = [records];
      }
      var fields;
      if (useAll) {
        fields = entity.create();
      } else {
        fields = entity.getPrimaryKey();
      }

      var recqueries = [];
      for (i = 0; i < recordAry.length; i++) {
        var usable  = false;
        var params = {};
        for (var field in fields) {
          if (typeof(fields[field]) === 'function') {
            continue;
          }
          if (recordAry[i][field] !== undefined) {
            if (recordAry[i][field] === null && useNull === false) {
              continue;
            }
            params[field] = recordAry[i][field];
            usable = true;
          } else {
            if (!useAll) {
              usable = false;
              break;
            }
          }
        }
        if (usable === false) {
          continue;
        }
        
        // create query for selected record.
        var que;
        que = Util.createQueryWithParams(entity, params, null, header);
        if (que && que.length > 0) {
          que =  '(' + que + ')';
          recqueries.push(que);
        }
      }
      recquery = Util.connectSearchQuery(recqueries, true);
      if (recquery && recquery.length > 0) {
        recquery = '(' + recquery + ')';
        queries.push(recquery);
      }      
    }
    if (query && query.length > 0) {
      queries.push(query);
    }

    return Util.connectSearchQuery(queries);
  },
  createQueryWithParams : function(entity, params, query, header) {
    if (!query) {
      if (!entity || !params) {
        return;
      }
    }
       
    var isBitFunc = false;
    if (entity.isBitField) {
      isBitFunc = true;
    }

    var queries = [];
    for (var field in params) {
      // check existence of field
      var isExist = entity.isExist(field);
      if (isExist !== true) {
        continue;
      }
      var isBit = false;
      if (isBitFunc) {
        if (entity.isBitField(field) === true) {
          isBit = true;
        }
      }

      var values = [];
      var value = params[field];
      if (!value) {
        continue;
      }
      if (value instanceof Array) {
        if (value.length === 0) {
          continue;
        }
        values = value;
      } else {
        values.push(value);
      }
      if (values.length > 0) {
        var que;
        var escape = entity.useEscape(field);
        que = Util.whereString(field, values, escape, header, isBit);
        queries.push(que);
      }
    }
    if (query && query.length > 0) {
      queries.push(query);
    }

    return Util.connectSearchQuery(queries);
  },
  convertToArray : function(obj) {
    if (!obj) {return;}
    if (!(obj instanceof Array)) {
      obj = [obj];
    }
    return obj;
  }
};

module.exports = Util;

