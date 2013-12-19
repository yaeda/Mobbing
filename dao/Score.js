/*
* Object for Score
*/

var Score = {
  create: function(data) {
    data = data || {};
    var entity = {
      id       : undefined,
      score    : undefined,
      timestamp: undefined,
      User_id  : undefined,
      Event_id : undefined
    };
    
    if (data) {
      for (field in entity) {
        if (typeof data[field] === 'function') {
          continue;
        }
        if (typeof data[field] !== 'undefined') {
          if (!Score.useEscape(field)) {
            if (isNaN(data[field]) === true) {
              continue;
            }
          }
          entity[field] = data[field];
        }
      }
    }
    
    return entity;
  },
  initialize: function(obj) {
    if (!obj) {
      return;
    }
        
    obj.id        = null;
    obj.score     = null;
    obj.timestamp = null;
    obj.User_id   = null;
    obj.Event_id  = null;
  },
  setUndefined: function(obj) {
    if (!obj) {
      return;
    }
        
    obj.id        = undefined;
    obj.score     = undefined;
    obj.timestamp = undefined;
    obj.User_id   = undefined;
    obj.Event_id  = undefined;
  },
  isExist: function(field) {
    if (!field) {
      return;
    }
    var table = {
      id       : true,
      score    : true,
      timestamp: true,
      User_id  : true,
      Event_id : true
    };
    return table[field];
  },
  getAI: function() {
    return 'id';
  },
  getKeys: function() {
    return {
      id : 'MUL',
      User_id : 'PRI',
      Event_id : 'PRI'
    };
  },
  getPrimaryKey: function() {
    return {
      User_id : 'PRI',
      Event_id : 'PRI'
    };
  },
  getTableName: function() {
    return 'Score';
  },
  getType: function(field) {
    if (!field) {
      return;
    }
    var type = {
      id       : 'int(11)',
      score    : 'int(11)',
      timestamp: 'bigint(20)',
      User_id  : 'int(11)',
      Event_id : 'int(11)'
    };
    return type[field];
  },
  getDefault: function(field) {
    if (!field) {
      return;
    }
    var type = {
      id       : null,
      score    : null,
      timestamp: null,
      User_id  : null,
      Event_id : null
    };
    return type[field];
  },
  useEscape: function(field) {
    if (!field) {
      return;
    }
    var escape = {
    };
    return escape[field];
  }
};

module.exports = Score;

