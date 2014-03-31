/**
Model Class
*/

var util = require('util');


/**
Expose Model
*/
module.exports = Model;


/**
Base Model function constructor

@param {Object} data             the model data
*/
function Model(data) {
  var dataKeys = data && Object.keys(data);
  var i, len;

  Object.defineProperty(this, '_data', {
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




/**
Models Exception
*/
function ModelException(msg) {
  msg && (this.message = msg);
  Error.apply(this, arguments);
  Error.captureStackTrace(this, this.constructor);
};
util.inherits(ModelException, Error);
ModelException.prototype.name = ModelException.name;
