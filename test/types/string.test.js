/**
String validation
*/
'use strict';

describe('Test Type String', function () {

  const validator = require('../../lib/types/string');


  it('should validate', function () {
    [
      undefined, null,
      '', 'foo'
    ].forEach(function (value) {
      (value === validator(value)).should.be.true();
    });
  });

  it('should throw', function () {
    [
      -1, 0, 1, Infinity, NaN,
      true, false,
      {}, Object.create(null),
      function () {}, /./, new Date(),
      [], new Array()
    ].forEach(function (value) {
      (function () { validator(value); }).should.throw(/Invalid string/);
    });
  });

});