var util = require('util');

var objectutil = {
  isObject: function(obj) {
    if (!obj) {
      return false;
    }
    if (typeof(obj) === 'object') {
      return true;
    } else {
      return false;
    }
  },
  isArray: function(obj) {
    return util.isArray(obj);
  },
  isFunction: function(obj) {
    if (!obj) {
      return false;
    }
    if (typeof obj === 'function') {
      return true;
    } else {
      return false;
    }
  },
  isString: function(obj) {
    if (!obj) {
      return false;
    }
    if (typeof obj === 'string') {
      return true;
    } else {
      return false;
    }
  },
  isNumber: function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  },
  toArray: function(obj) {
    if (!obj) {
      return null;
    }
    if (objectutil.isArray(obj)) {
      return obj;
    } else {
      return [obj];
    }
  }
};

module.exports = objectutil;
