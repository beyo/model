/**
Model Class
*/

var util = require('util');
var CollectionException = require('./exceptions').CollectionException;


/**
Expose Collection class
*/
module.exports = Collection;


/**
Create a new collection

@param {Object} options       the options
*/
function Collection(options) {
  if (!(this instanceof Collection)){
    return new Collection(options);
  }

  options = options || {};

  if (options instanceof Array) {
    this.modelType = undefined;
    this.items = options;
  } else {
    this.modelType = options.modelType;
    this.items = options.items || [];

    if (!(this.items instanceof Array)) {
      throw new CollectionException('Items must be an array');
    }
  }
};


Collection.prototype.forEach = forEach;
Collection.prototype.find = find;
Collection.prototype.findAll = findAll;
Collection.prototype.remove = remove;
Collection.prototype.removeAll = removeAll;


/**
Find the first item matching filter

@param {string|Object} filter      the filter
@return {Object}                   the model found
*/
function find(filter) {
  var item;
  var i;
  var ilen;
  var keys;
  var key;
  var k;
  var klen;
  var found;

  if (filter instanceof Function) {
    for (i = 0, ilen = this.items.length; i < ilen; ++i) {
      item = this.items[i];
      if (filter(item, i)) {
        return item;
      }
    }
  } else if (filter !== null && filter !== undefined) {
    if (typeof filter === 'object') {
      keys = Object.keys(filter);
      klen = keys.length;
      for (i = 0, ilen = this.items.length; i < ilen; ++i) {
        item = this.items[i];
        found = true;
        for (k = 0; k < klen && found; ++k) {
          key = keys[k];
          if (filter[key] !== item[key]) {
            found = false;
          }
        }
        if (found) {
          return item;
        }
      }
    } else if (this.modelType) {
      keys = Object.keys(this.modelType.attributes);
      klen = keys.length;
      for (i = 0, ilen = this.items.length; i < ilen; ++i) {
        item = this.items[i];
        found = false;
        for (k = 0; k < klen && !found; ++k) {
          key = keys[k];
          if (filter === item[key]) {
            found = true;
          }
        }
        if (found) {
          return item;
        }
      }
    } else {
      for (i = 0, ilen = this.items.length; i < ilen; ++i) {
        item = this.items[i];
        found = false;
        keys = Object.keys(item);
        for (k = 0, klen = keys.length; k < klen && !found; ++k) {
          key = keys[k];
          if (filter === item[key]) {
            found = true;
          }
        }
        if (found) {
          return item;
        }
      }
    }
  }

  return undefined;
}


/**
Find all the items matching filter

@param {string|Object} filter      the filter
@return {Array}                    the array of models found
*/
function findAll(filter) {
  var items = [];
  var item;
  var i;
  var ilen;
  var keys;
  var key;
  var k;
  var klen;
  var found;

  if (filter instanceof Function) {
    for (i = 0, ilen = this.items.length; i < ilen; ++i) {
      item = this.items[i];
      if (filter(item, i)) {
        items.push(item);
      }
    }
  } else if (filter !== null && filter !== undefined) {
    if (typeof filter === 'object') {
      keys = Object.keys(filter);
      klen = keys.length;
      for (i = 0, ilen = this.items.length; i < ilen; ++i) {
        item = this.items[i];
        found = true;
        for (k = 0; k < klen && found; ++k) {
          key = keys[k];
          if (filter[key] !== item[key]) {
            found = false;
          }
        }
        if (found) {
          items.push(item);
        }
      }
    } else if (this.modelType) {
      keys = Object.keys(this.modelType.attributes);
      klen = keys.length;
      for (i = 0, ilen = this.items.length; i < ilen; ++i) {
        item = this.items[i];
        found = false;
        for (k = 0; k < klen && !found; ++k) {
          key = keys[k];
          if (filter === item[key]) {
            found = true;
          }
        }
        if (found) {
          items.push(item);
        }
      }
    } else {
      for (i = 0, ilen = this.items.length; i < ilen; ++i) {
        item = this.items[i];
        found = false;
        keys = Object.keys(item);
        for (k = 0, klen = keys.length; k < klen && !found; ++k) {
          key = keys[k];
          if (filter === item[key]) {
            found = true;
          }
        }
        if (found) {
          items.push(item);
        }
      }
    }
  }

  return new Collection({
    modelType: this.modelType,
    items: items
  });
}


/**
Remove the first item matching filter and return it. Returns false if no
match was found

@param {string|Object} filter      the filter
@return {Object}                   the removed model
*/
function remove(filter) {
  var item;
  var i;
  var ilen;
  var keys;
  var key;
  var k;
  var klen;
  var found;

  if (filter instanceof Function) {
    for (i = 0, ilen = this.items.length; i < ilen; ++i) {
      item = this.items[i];
      if (filter(item, i)) {
        return this.items.splice(i, 1).pop();
      }
    }
  } else if (filter !== null && filter !== undefined) {
    if (typeof filter === 'object') {
      keys = Object.keys(filter);
      klen = keys.length;
      for (i = 0, ilen = this.items.length; i < ilen; ++i) {
        item = this.items[i];
        found = true;
        for (k = 0; k < klen && found; ++k) {
          key = keys[k];
          if (filter[key] !== item[key]) {
            found = false;
          }
        }
        if (found) {
          return this.items.splice(i, 1).pop();
        }
      }
    } else if (this.modelType) {
      keys = Object.keys(this.modelType.attributes);
      klen = keys.length;
      for (i = 0, ilen = this.items.length; i < ilen; ++i) {
        item = this.items[i];
        found = false;
        for (k = 0; k < klen && !found; ++k) {
          key = keys[k];
          if (filter === item[key]) {
            found = true;
          }
        }
        if (found) {
          return this.items.splice(i, 1).pop();
        }
      }
    } else {
      for (i = 0, ilen = this.items.length; i < ilen; ++i) {
        item = this.items[i];
        found = false;
        keys = Object.keys(item);
        for (k = 0, klen = keys.length; k < klen && !found; ++k) {
          key = keys[k];
          if (filter === item[key]) {
            found = true;
          }
        }
        if (found) {
          return this.items.splice(i, 1).pop();
        }
      }
    }
  }

  return false;
}


/**
Remove all the items matching filter and return the count. Returns 0 if no
items were removed

@param {string|Object} filter      the filter
@return {Number}                   the number of removed items
*/
function removeAll(filter) {
  var item;
  var i;
  var ilen;
  var keys;
  var key;
  var k;
  var klen;
  var found;
  var count = 0;

  if (filter instanceof Function) {
    for (i = 0, ilen = this.items.length; i < ilen; ++i) {
      item = this.items[i];
      if (filter(item, i)) {
        this.items.splice(i--, 1);
        ++count;
        --ilen;
      }
    }
  } else if (filter !== null && filter !== undefined) {
    if (typeof filter === 'object') {
      keys = Object.keys(filter);
      klen = keys.length;
      for (i = 0, ilen = this.items.length; i < ilen; ++i) {
        item = this.items[i];
        found = true;
        for (k = 0; k < klen && found; ++k) {
          key = keys[k];
          if (filter[key] !== item[key]) {
            found = false;
          }
        }
        if (found) {
          this.items.splice(i--, 1);
          ++count;
          --ilen;
        }
      }
    } else if (this.modelType) {
      keys = Object.keys(this.modelType.attributes);
      klen = keys.length;
      for (i = 0, ilen = this.items.length; i < ilen; ++i) {
        item = this.items[i];
        found = false;
        for (k = 0; k < klen && !found; ++k) {
          key = keys[k];
          if (filter === item[key]) {
            found = true;
          }
        }
        if (found) {
          this.items.splice(i--, 1);
          ++count;
          --ilen;
        }
      }
    } else {
      for (i = 0, ilen = this.items.length; i < ilen; ++i) {
        item = this.items[i];
        found = false;
        keys = Object.keys(item);
        for (k = 0, klen = keys.length; k < klen && !found; ++k) {
          key = keys[k];
          if (filter === item[key]) {
            found = true;
          }
        }
        if (found) {
          this.items.splice(i--, 1);
          ++count;
          --ilen;
        }
      }
    }
  }

  return count;
}


/**
Same as collection.items.forEach but using a yieldable action
*/
function * forEach(action) {
  var i;
  var ilen;

  if (!(action instanceof Function)) {
    throw CollectionException('Action must be a function');
  }

  for (i = 0, ilen = this.items.length; i < ilen; ++i) {
    yield action(this.items[i], i);
  }
}
