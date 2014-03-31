/**
Model Class
*/
module.exports = Collection;


function Collection(options) {


};


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
    for (i = 0, ilen = this._data.length; i < ilen; ++i) {
      item = this._data[i];
      if (filter.call(item, i)) {
        items.push(item);
      }
    }
  } else if (filter !== null && filter !== undefined) {
    if (typeof filter === 'object') {
      keys = Object.keys(filter);
      klen = keys.length;
      for (i = 0, ilen = this._data.length; i < ilen; ++i) {
        item = this._data[i];
        found = true;
        for (k = 0; k < klen && found; ++k) {
          key = keys[k];
          if (filter[key] !== this._data[key]) {
            found = false;
          }
        }
        if (found) {
          items.push(item);
        }
      }
    } else {
      // TODO : scan model types for any value matching `filter`
    }
  }

  return items;
}
