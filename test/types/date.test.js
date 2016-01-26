/**
Date validation
*/
'use strict';

describe('Test Type Date', function () {

  const validator = require('../../lib/types/date');


  it('should validate', function () {
    [
      new Date(), new Date(Date.now())
    ].forEach(function (value) {
      (value === validator(value)).should.be.true();
    });
  });

  it('should validate with transform', function () {
    [
      Date.now(),
      new Date().getTime(),
      Date.now().toString(),
      '2000-01-01',
      //'0:00:00',
      '2000-01-01 0:00:00',
      '2000-01-01T00:00:00.000Z',
      //'Sat, 01 Jan 2000 0:00:00 GMT',
      //'Sat, 01 Jan 2000 0:00:00 +0000'
    ].forEach(function (value) {
      validator(value).should.be.instanceOf(Date);
    });
  });

  it('should throw', function () {
    [
      undefined, null,
      NaN, Infinity,
      '', 'foo',
      function () {}, {}, /./,
      [], new Array()
    ].forEach(function (value) {
      (function () { validator(value); }).should.throw(/Invalid date/);
    });
  });

});