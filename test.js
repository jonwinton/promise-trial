import { expect } from 'chai';
import lib from './src';

const err = 'A rejected Promise',
  one = new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, 200);
  }),
  two = new Promise((resolve) => {
    setTimeout(() => {
      resolve(2);
    }, 400);
  }),
  three = new Promise((resolve) => {
    setTimeout(() => {
      resolve(3);
    }, 600);
  }),
  failingPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(err);
    }, 100);
  });

// A test which will return true
function lessThanFour(val) {
  return val < 4;
}

// A test which will return false
function lessThanThree(val) {
  return val < 3;
}

// Test that arguments can be passed in
function comparitorWithArgs(val, arg1, arg2) {
  return arg1 === 'arg1' && arg2 === 'arg2';
}

describe('Promise Trial', function () {
  // Initialization errors
  describe('throws an Error', function () {
    it('if no arguments are passed in', function () {
      expect(lib).to.throw(Error);
    });

    it('if argument does not include `promise` and `comparitor` arguments', function () {
      lib([{}]).catch(e => { expect(e).to.be.an('error'); })
    });
  });

  describe('allows arguments to be passed', function () {
    it('into each comparitor function', function () {
      return lib([{
          promise: one,
          comparitor: comparitorWithArgs
        }], 'arg1', 'arg2')
        .then(function (resp) {
          expect(resp.passed).to.be.true;
        })
    });
  });

  // Successful Promises
  describe('when successful the return object contains', function () {
    var fn = lib([{
      promise: one,
      comparitor: lessThanFour
    }, {
      promise: two,
      comparitor: lessThanFour
    }, {
      promise: three,
      comparitor: lessThanFour
    }]);

    it('a `passed` key set to `true`', function () {
      return fn.then(results => { expect(results.passed).to.be.true; });
    });

    it('a `resolvedData` key set to an array of values', function () {
      return fn.then(results => { expect(results.resolvedData).to.deep.equal([1, 2, 3]); });
    });

    it('a `count` key set to the total count of arguments passed in', function () {
      return fn.then(results => { expect(results.count).to.equal(3); });
    });

    it('a `rejected` key set to an empty array if no Promises were rejected', function () {
      return fn.then(results => { expect(results.rejected.length).to.equal(0); });
    });
  });

  // When one or more Promise fails
  describe('when one or more Promises reject but the rest all pass the return object contains', function () {
    var fn = lib([{
      promise: one,
      comparitor: lessThanFour
    }, {
      promise: failingPromise,
      comparitor: lessThanFour
    }, {
      promise: two,
      comparitor: lessThanFour
    }, {
      promise: three,
      comparitor: lessThanFour
    }]);

    it('a `passed` key set to `true`', function () {
      return fn.then(results => { expect(results.passed).to.be.true; });
    });

    it('a `resolvedData` key set to an array of values with `null` for any failing Promise', function () {
      return fn.then(results => { expect(results.resolvedData).to.deep.equal([1, null, 2, 3]); });
    });

    it('a `count` key set to the total count of arguments passed in', function () {
      return fn.then(results => { expect(results.count).to.equal(4); });
    });

    it('a `rejected` key set to an empty array if no Promises were rejected', function () {
      return fn.then(results => { expect(results.rejected.length).to.equal(1); });
    });

    it('a `rejected` key with objects which contain the index of the failed Promise', function () {
      return fn.then(results => { expect(results.rejected[0].index).to.equal(1); });
    });

    it('a `rejected` key with objects which contain the error of the failed Promise', function () {
      return fn.then(results => { expect(results.rejected[0].err.message).to.equal(err); });
    });
  });

  // Failing tests
  describe('when fails the return object contains', function () {
    var fn = lib([{
      promise: one,
      comparitor: lessThanFour
    }, {
      promise: two,
      comparitor: lessThanFour
    }, {
      promise: three,
      comparitor: lessThanThree
    }]);

    it('a `passed` key set to `false`', function () {
      return fn.then(results => { expect(results.passed).to.be.false; });
    });

    it('a `failedIndex` key set to the Promise\'s index which failed', function () {
      return fn.then(results => { expect(results.failedIndex).to.equal(2); });
    });
  });
});
