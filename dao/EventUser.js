/*
* Object for EventUser
*/

var EventUser = {
  create: function(data) {
    data = data || {};
    var entity = {
      Event_id: undefined,
      User_id : undefined,
      joindate: undefined
    };
    
    if (data) {
      for (field in entity) {
        if (typeof data[field] === 'function') {
          continue;
        }
        if (typeof data[field] !== 'undefined') {
          if (!EventUser.useEscape(field)) {
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
        
    obj.Event_id = null;
    obj.User_id  = null;
    obj.joindate = null;
  },
  setUndefined: function(obj) {
    if (!obj) {
      return;
    }
        
    obj.Event_id = undefined;
    obj.User_id  = undefined;
    obj.joindate = undefined;
  },
  isExist: function(field) {
    if (!field) {
      return;
    }
    var table = {
      Event_id: true,
      User_id : true,
      joindate: true
    };
    return table[field];
  },
  getAI: function() {
    return undefined;
  },
  getKeys: function() {
    return {
      Event_id : 'PRI',
      User_id : 'PRI'
    };
  },
  getPrimaryKey: function() {
    return {
      Event_id : 'PRI',
      User_id : 'PRI'
    };
  },
  getTableName: function() {
    return 'EventUser';
  },
  getType: function(field) {
    if (!field) {
      return;
    }
    var type = {
      Event_id: 'int(11)',
      User_id : 'int(11)',
      joindate: 'bigint(20)'
    };
    return type[field];
  },
  getDefault: function(field) {
    if (!field) {
      return;
    }
    var type = {
      Event_id: null,
      User_id : null,
      joindate: null
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

module.exports = EventUser;

