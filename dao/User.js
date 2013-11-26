/*
* Object for User
*/

var User = {
  create: function(data) {
    data = data || {};
    var entity = {
      id      : undefined,
      name    : undefined,
      email   : undefined,
      password: undefined,
      icon_url: undefined
    };
    
    if (data) {
      for (field in entity) {
        if (typeof data[field] === 'function') {
          continue;
        }
        if (typeof data[field] !== 'undefined') {
          if (!User.useEscape(field)) {
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
        
    obj.id       = null;
    obj.name     = null;
    obj.email    = null;
    obj.password = null;
    obj.icon_url = null;
  },
  setUndefined: function(obj) {
    if (!obj) {
      return;
    }
        
    obj.id       = undefined;
    obj.name     = undefined;
    obj.email    = undefined;
    obj.password = undefined;
    obj.icon_url = undefined;
  },
  isExist: function(field) {
    if (!field) {
      return;
    }
    var table = {
      id      : true,
      name    : true,
      email   : true,
      password: true,
      icon_url: true
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
    return 'User';
  },
  getType: function(field) {
    if (!field) {
      return;
    }
    var type = {
      id      : 'int(11)',
      name    : 'varchar(45)',
      email   : 'varchar(45)',
      password: 'varchar(45)',
      icon_url: 'varchar(45)'
    };
    return type[field];
  },
  getDefault: function(field) {
    if (!field) {
      return;
    }
    var type = {
      id      : null,
      name    : null,
      email   : null,
      password: null,
      icon_url: null
    };
    return type[field];
  },
  useEscape: function(field) {
    if (!field) {
      return;
    }
    var escape = {
      name: true,
      email: true,
      password: true,
      icon_url: true
    };
    return escape[field];
  }
};

module.exports = User;

