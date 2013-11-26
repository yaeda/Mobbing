/*
* Object for Game
*/

var Game = {
  create: function(data) {
    data = data || {};
    var entity = {
      id  : undefined,
      name: undefined
    };
    
    if (data) {
      for (field in entity) {
        if (typeof data[field] === 'function') {
          continue;
        }
        if (typeof data[field] !== 'undefined') {
          if (!Game.useEscape(field)) {
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
        
    obj.id   = null;
    obj.name = null;
  },
  setUndefined: function(obj) {
    if (!obj) {
      return;
    }
        
    obj.id   = undefined;
    obj.name = undefined;
  },
  isExist: function(field) {
    if (!field) {
      return;
    }
    var table = {
      id  : true,
      name: true
    };
    return table[field];
  },
  getAI: function() {
    return 'id';
  },
  getKeys: function() {
    return {
      id : 'PRI'
    };
  },
  getPrimaryKey: function() {
    return {
      id : 'PRI'
    };
  },
  getTableName: function() {
    return 'Game';
  },
  getType: function(field) {
    if (!field) {
      return;
    }
    var type = {
      id  : 'int(11)',
      name: 'varchar(45)'
    };
    return type[field];
  },
  getDefault: function(field) {
    if (!field) {
      return;
    }
    var type = {
      id  : null,
      name: null
    };
    return type[field];
  },
  useEscape: function(field) {
    if (!field) {
      return;
    }
    var escape = {
      name: true
    };
    return escape[field];
  }
};

module.exports = Game;

