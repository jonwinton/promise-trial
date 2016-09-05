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
      completed = 0;

    for (let i = 0; i < count; i++) {
      // Alias current item
      let item = arr[i];

      // If no `promise` or `comparitor` properties
      if (!item.promise || !item.comparitor) {
        reject(new Error(`Promise-Trial: argument at index ${i} must contain a 'promise' and 'comparitor' argument`));
      }

      // When the promise resolves test
      // against the comparitor
      item.promise
        .then(function (i, resp) {
          // If comparitor fails, exit immediately
          if (!comparitorWithArgs(resp, args, item.comparitor)) {
            resolve({
              failedIndex: i,
              passed: false
            });
          } else {
            completed++; // Otherwise iterate completed count and continue
            resolvedData[i] = resp;
          }

          // If the `completed` and `count` equal then we're done
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
          // If there's failure in one of the Promises keep processing
          // the rest but store the error data
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
