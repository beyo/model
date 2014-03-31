
var collections = require('../../lib/collection');

describe('Test Collection', function () {

  var items = [
    { "firstName": "Annette"  , "lastName": "Mcknight", active: true                 },
    { "firstName": "David"    , "lastName": "Kelley"  , active: true,  custom: 'foo' },
    { "firstName": "Grace"    , "lastName": "Becker"  , active: false                },
    { "firstName": "Mcpherson", "lastName": "Guerrero", active: false                },
    { "firstName": "Rogers"   , "lastName": "Burch"   , active: false, custom: 'foo' },
    { "firstName": "Gabrielle", "lastName": "Rogers"  , active: true                 },
    { "firstName": "Cherie"   , "lastName": "David"   , active: true                 },
    { "firstName": "Susanne"  , "lastName": "Grace"   , active: true                 }
  ];

  var modelType = {
    attributes: {
      firstName: { type: 'string' },
      lastName: { type: 'string' }
    }

  };


  it('should expose exceptions', function () {
    collections.exceptions.should.be.an.Object;
    collections.exceptions.CollectionException.should.be.an.Function;

    new collections.exceptions.CollectionException().should.be.an.Error;
  });

  it('should create new instances', function () {
    var col = collections.Collection();

    col.should.be.instanceof(collections.Collection);
    col.items.should.be.an.Array;
  });

  it('should fail to create new instances', function () {
    [
      true, 'test', {}, 123
    ].forEach(function (items) {
      (function () { collections.Collection({ items: items }); }).should.throw();
    });
  });

  describe('filter', function () {

    it('should find with callback', function () {
      var col = collections.Collection(items);

      col.find(function (item) {
        return item.firstName === 'Rogers';
      }).should.equal(items[4]);

      col.find(function (item) {
        return item.firstName === 'Rogers' || item.lastName === 'Becker';
      }).should.equal(items[2]);
    });

    it('should find with object', function () {
      var col = collections.Collection(items);

      col.find({ custom: 'foo' }).should.equal(items[1]);
      col.find({ firstName: 'Rogers' }).should.equal(items[4]);
      col.find({ firstName: 'Grace', lastName: 'Becker' }).should.equal(items[2]);
    });

    it('should find with value', function () {
      var col = collections.Collection(items);

      col.find(true).should.equal(items[0]);
      col.find('Rogers').should.equal(items[4]);
      col.find('David').should.equal(items[1]);
    });

    it('should find with value+modelType', function () {
      var col = collections.Collection({ items: items, modelType: modelType });

      assert.equal(col.find(true), undefined);
      col.find('Rogers').should.equal(items[4]);
      col.find('David').should.equal(items[1]);
    });

  });

  describe('filterAll', function () {

    it('should find all with callback', function () {
      var col = collections.Collection(items);
      var result;

      result = col.findAll(function (item) {
        return item.firstName === 'Rogers';
      });
      result.should.be.instanceof(collections.Collection);
      result.items.should.be.an.Array.and.have.lengthOf(1);
      result.items[0].should.equal(items[4]);


      result = col.findAll(function (item) {
        return item.firstName === 'Rogers' || item.lastName === 'Becker';
      });
      result.should.be.instanceof(collections.Collection);
      result.items.should.be.an.Array.and.have.lengthOf(2);
      result.items.should.eql([ items[2], items[4] ]);
    });

    it('should find all with object', function () {
      var col = collections.Collection(items);
      var result;

      result = col.findAll({ custom: 'foo' });
      result.should.be.instanceof(collections.Collection);
      result.items.should.be.an.Array.and.have.lengthOf(2);
      result.items.should.eql([ items[1], items[4] ]);

      result = col.findAll({ firstName: 'Rogers' });
      result.should.be.instanceof(collections.Collection);
      result.items.should.be.an.Array.and.have.lengthOf(1);
      result.items.should.eql([ items[4] ]);

      result = col.findAll({ firstName: 'Grace', lastName: 'Becker' });
      result.should.be.instanceof(collections.Collection);
      result.items.should.be.an.Array.and.have.lengthOf(1);
      result.items.should.eql([ items[2] ]);
    });

    it('should find all with value', function () {
      var col = collections.Collection({ items: items });
      var result;

      result = col.findAll('foo');
      result.should.be.instanceof(collections.Collection);
      result.items.should.be.an.Array.and.have.lengthOf(2);
      result.items.should.eql([ items[1], items[4] ]);


      result = col.findAll('Rogers');
      result.should.be.instanceof(collections.Collection);
      result.items.should.be.an.Array.and.have.lengthOf(2);
      result.items.should.eql([ items[4], items[5] ]);

      result = col.findAll('David');
      result.should.be.instanceof(collections.Collection);
      result.items.should.be.an.Array.and.have.lengthOf(2);
      result.items.should.eql([ items[1], items[6] ]);
    });

    it('should find all with value+modelType', function () {
      var col = collections.Collection({ items: items, modelType: modelType });
      var result;

      result = col.findAll('foo');
      result.should.be.instanceof(collections.Collection);
      result.items.should.be.an.Array.and.have.lengthOf(0);

      result = col.findAll('Rogers');
      result.should.be.instanceof(collections.Collection);
      result.items.should.be.an.Array.and.have.lengthOf(2);
      result.items.should.eql([ items[4], items[5] ]);

      result = col.findAll('David');
      result.should.be.instanceof(collections.Collection);
      result.items.should.be.an.Array.and.have.lengthOf(2);
      result.items.should.eql([ items[1], items[6] ]);
    });
  });

  describe('remove', function () {

    it('should remove with callback', function () {
      var col = collections.Collection(items.slice(0));
      var result;

      result = col.remove(function (item) {
        return item.firstName === 'Rogers' || item.lastName === 'Rogers';
      });
      result.should.equal(items[4]);
      col.items.should.have.lengthOf(items.length - 1);
    });

    it('should remove with object', function () {
      var col = collections.Collection(items.slice(0));

      col.remove({ custom: 'foo' }).should.be.equal(items[1]);
      col.remove({ firstName: 'Rogers' }).should.equal(items[4]);
      col.remove({ firstName: 'Grace', lastName: 'Becker' }).should.equal(items[2]);

      col.items.should.have.lengthOf(items.length - 3);
    });

    it('should remove with value', function () {
      var col = collections.Collection(items.slice(0));

      col.remove(true).should.equal(items[0]);
      col.remove('Rogers').should.equal(items[4]);
      col.remove('David').should.equal(items[1]);

      col.items.should.have.lengthOf(items.length - 3);
    });

    it('should remove with value+modelType', function () {
      var col = collections.Collection({ items: items.slice(0), modelType: modelType });

      assert.equal(col.remove(true), false);
      col.remove('Rogers').should.equal(items[4]);
      col.remove('David').should.equal(items[1]);

      col.items.should.have.lengthOf(items.length - 2);
    });

  });

  describe('removeAll', function () {

    it('should remove all with callback', function () {
      var col = collections.Collection(items.slice(0));
      var result;

      result = col.removeAll(function (item) {
        return item.firstName === 'Rogers';
      });
      result.should.be.a.Number.and.equal(1);
      col.items.should.have.lengthOf(items.length - 1);

      result = col.removeAll(function (item) {
        return item.firstName === 'David' || item.lastName === 'Becker';
      });
      result.should.be.a.Number.and.equal(2);
      col.items.should.have.lengthOf(items.length - 3);
    });

    it('should remove all with object', function () {
      var col = collections.Collection(items.slice(0));
      var result;

      result = col.removeAll({ custom: 'foo' });
      result.should.be.a.Number.and.equal(2);
      col.items.should.eql([ items[0], items[2], items[3], items[5], items[6], items[7] ]);

      result = col.removeAll({ firstName: 'Rogers' });
      result.should.be.a.Number.and.equal(0);
      col.items.should.eql([ items[0], items[2], items[3], items[5], items[6], items[7] ]);

      result = col.removeAll({ firstName: 'Grace', lastName: 'Becker' });
      result.should.be.a.Number.and.equal(1);
      col.items.should.eql([ items[0], items[3], items[5], items[6], items[7] ]);
    });

    it('should remove all with value', function () {
      var col = collections.Collection({ items: items.slice(0) });
      var result;

      result = col.removeAll('foo');
      result.should.be.a.Number.and.equal(2);
      col.items.should.eql([ items[0], items[2], items[3], items[5], items[6], items[7] ]);

      result = col.removeAll('Rogers');
      result.should.be.a.Number.and.equal(1);
      col.items.should.eql([ items[0], items[2], items[3], items[6], items[7] ]);

      result = col.removeAll('David');
      result.should.be.a.Number.and.equal(1);
      col.items.should.eql([ items[0], items[2], items[3], items[7] ]);
    });

    it('should remove all with value+modelType', function () {
      var col = collections.Collection({ items: items.slice(0), modelType: modelType });
      var result;

      result = col.removeAll('foo');
      result.should.be.a.Number.and.equal(0);
      col.items.should.eql([ items[0], items[1], items[2], items[3], items[4], items[5], items[6], items[7] ]);

      result = col.removeAll('Rogers');
      result.should.be.a.Number.and.equal(2);
      col.items.should.eql([ items[0], items[1], items[2], items[3], items[6], items[7] ]);

      result = col.removeAll('David');
      result.should.be.a.Number.and.equal(2);
      col.items.should.eql([ items[0], items[2], items[3], items[7] ]);
    });

  });

});
