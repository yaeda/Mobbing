/*
* Object for Event
*/

var Event = {
  create: function(data) {
    data = data || {};
    var entity = {
      id       : undefined,
      name     : undefined,
      state    : undefined,
      starttime: undefined,
      Game_id  : undefined
    };
    
    if (data) {
      for (field in entity) {
        if (typeof data[field] === 'function') {
          continue;
        }
        if (typeof data[field] !== 'undefined') {
          if (!Event.useEscape(field)) {
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
    obj.name      = null;
    obj.state     = null;
    obj.starttime = null;
    obj.Game_id   = null;
  },
  setUndefined: function(obj) {
    if (!obj) {
      return;
    }
        
    obj.id        = undefined;
    obj.name      = undefined;
    obj.state     = undefined;
    obj.starttime = undefined;
    obj.Game_id   = undefined;
  },
  isExist: function(field) {
    if (!field) {
      return;
    }
    var table = {
      id       : true,
      name     : true,
      state    : true,
      starttime: true,
      Game_id  : true
    };
    return table[field];
  },
  getAI: function() {
    return 'id';
  },
  getKeys: function() {
    return {
      id : 'PRI',
      Game_id : 'MUL'
    };
  },
  getPrimaryKey: function() {
    return {
      id : 'PRI'
    };
  },
  getTableName: function() {
    return 'Event';
  },
  getType: function(field) {
    if (!field) {
      return;
    }
    var type = {
      id       : 'int(11)',
      name     : 'varchar(45)',
      state    : 'int(11)',
      starttime: 'bigint(20)',
      Game_id  : 'int(11)'
    };
    return type[field];
  },
  getDefault: function(field) {
    if (!field) {
      return;
    }
    var type = {
      id       : null,
      name     : null,
      state    : null,
      starttime: null,
      Game_id  : null
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

module.exports = Event;

