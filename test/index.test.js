
describe('Module main test', function () {

  var moduleName = '../';
  var models;

  var ModelFoo = 'Foo';
  var ModelFooProto = {
    properties: {
      id: 'int',
      login: 'string'
    }
  };
  var ModelFooTypeName = 'FooModel';


  beforeEach(function () {
    models = require(moduleName);
  });

  afterEach(function () {
    var resolvedName = require.resolve(moduleName);
    delete require.cache[resolvedName];

    models.types.unregister('Foo');
  });

  it('should expose events', function () {
    [
      'on', 'once',
      'addListener', 'removeListener', 'removeAllListeners',
      'listeners'
    ].forEach(function(method) {
      models[method].should.be.a.Function;
    });
  });

  it('should create a named prototype', function () {
    models.define(ModelFoo, ModelFooProto).should.have.ownProperty('name').and.equal(ModelFooTypeName);

    models.get(ModelFoo).should.be.a.Function.and.have.ownProperty('name').and.equal(ModelFooTypeName);
  });

  it('should instanciate with properties', function () {
    var Foo = models.define(ModelFoo, ModelFooProto);

    var foo = new Foo();

    foo.should.have.property('id');
    foo.should.have.property('login');
  });

  it('should get the initial value set', function () {
    var Foo = models.define(ModelFoo, ModelFooProto);

    var foo = new Foo({ id: 123 });

    foo.id.should.equal(123);
  });

  it('should handle nested properties');

});
