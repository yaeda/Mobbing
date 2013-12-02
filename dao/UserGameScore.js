/*
* Object for UserGameScore
*/

var UserGameScore = {
  create: function(data) {
    data = data || {};
    var entity = {
      User_id: undefined,
      Game_id: undefined,
      score  : undefined
    };
    
    if (data) {
      for (field in entity) {
        if (typeof data[field] === 'function') {
          continue;
        }
        if (typeof data[field] !== 'undefined') {
          if (!UserGameScore.useEscape(field)) {
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
        
    obj.User_id = null;
    obj.Game_id = null;
    obj.score   = null;
  },
  setUndefined: function(obj) {
    if (!obj) {
      return;
    }
        
    obj.User_id = undefined;
    obj.Game_id = undefined;
    obj.score   = undefined;
  },
  isExist: function(field) {
    if (!field) {
      return;
    }
    var table = {
      User_id: true,
      Game_id: true,
      score  : true
    };
    return table[field];
  },
  getAI: function() {
    return undefined;
  },
  getKeys: function() {
    return {
      User_id : 'PRI',
      Game_id : 'PRI'
    };
  },
  getPrimaryKey: function() {
    return {
      User_id : 'PRI',
      Game_id : 'PRI'
    };
  },
  getTableName: function() {
    return 'UserGameScore';
  },
  getType: function(field) {
    if (!field) {
      return;
    }
    var type = {
      User_id: 'int(11)',
      Game_id: 'int(11)',
      score  : 'int(11)'
    };
    return type[field];
  },
  getDefault: function(field) {
    if (!field) {
      return;
    }
    var type = {
      User_id: null,
      Game_id: null,
      score  : null
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

module.exports = UserGameScore;

