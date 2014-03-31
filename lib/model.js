/**
Model Class
*/
module.exports = Model;


function Model(properties, data) {
  var dataKeys = data && Object.keys(data);
  var i, len;

  Object.defineProperties(this, properties);
  Object.defineProperty(this, 'data', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: {}
  });

  if (dataKeys) {
    for (i = 0, len = dataKeys.length; i < len; i++) {
      this[dataKeys[i]] = data[dataKeys[i]];
    }
  }

}
