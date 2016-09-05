/**
 * Return an immediately invoked function which is itself
 * a wrapper for a function with the arguments and response
 * object of the Promise passed in as arguments.
 *
 * i.e. wrap the `comparitor` function so that arguments
 * passed into the trial are also passed to the `comparitor`
 *
 * @param  {Any} resp            The response from whatever Promise
 * @param  {Array} args          Arguments passed into the trial
 * @param  {Function} comparitor The `comparitor` function passed in with each Promise
 * @return {Function}
 */
function comparitorWithArgs(resp, args, comparitor) {
  return (function () {
    var passedArgs = Array.isArray(resp) ? resp.concat(args) : [resp].concat(args);
    return comparitor.apply(null, passedArgs);
  })();
}

/**
 * Trial function. Accepts an array of objects filled with promises
 * and comparitor functions to test the validity of a response
 *
 * @param  {Array}  arr   Array of trial objects
 * @param  {...Any} args  Any arguments that need to be passed into each comparitor function
 * @return {Promise}
 */
export default function (arr, ...args) {
  if (!arr || !arr.length) {
    throw new Error('Promise-Trial: At least one entry is required to test.');
  }

  return new Promise((resolve, reject) => {
    var count = arr.length,
      resolvedData = [],
      rejected = [],
      completed = 0,
      i = 0,
      item = null;

    for (i; i < count; i++) {
      // Alias current item
      item = arr[i];

      if (!item.promise || !item.comparitor) {
        reject(new Error(`Promise-Trial: argument at index ${i} must contain a 'promise' and 'comparitor' argument`));
      }

      item.promise
        .then(function (i, resp) {
          if (!comparitorWithArgs(resp, args, item.comparitor)) {
            resolve({
              failedIndex: i,
              passed: false
            });
          } else {
            completed++;
            resolvedData[i] = resp;
          }

          if (completed === count) {
            resolve({
              count,
              resolvedData,
              rejected,
              passed: true
            });
          }
        }.bind(null, i)) // Bind in the index value for tracking
        .catch(function (index, e) {
          var err = new Error(e);
          rejected.push({
            err,
            index
          });
          resolvedData[index] = null;
          completed++;
        }.bind(null, i)); // Bind in the index value for better messaging
    }
  });
}
