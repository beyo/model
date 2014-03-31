
var model = require('../');

describe('Test main', function () {

  it('should expose Model', function () {
    model.Model.should.equal(require('../lib/model'));
  });

  it('should expose Collection', function () {
    model.Collection.should.equal(require('../lib/collection'));
  });

  it('should expose Types', function () {
    model.Types.should.equal(require('../lib/types'));
  });

});
