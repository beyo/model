
var model = require('../lib/');


describe('Module main test', function () {

  after(function () {
    model.types.unregister('Foo');
  });

  it('should expose events', function () {
    model.events.should.be.instanceof(require('events').EventEmitter);
  });

  it('should create a named prototype', function () {
    model.define('Foo', {}).should.have.ownProperty('name').and.equal('FooModel');

    model('Foo').should.be.a.Function.and.have.ownProperty('name').and.equal('FooModel');
  });

  it('should instanciate with properties', function () {
    var Foo = model.define('Foo', {
      properties: {
        id: 'int',
        login: 'string'
      }
    });

    var foo = new Foo();

    foo.should.have.ownProperty('id');
    foo.should.have.ownProperty('login');
  });

  it('should get the initial value set', function () {
    var Foo = model.define('Foo', {
      properties: {
        id: 'int',
        login: 'string'
      }
    });

    var foo = new Foo({ id: 123 });

    foo.id.should.equal(123);
  });

  it('should handle nested properties');

});
