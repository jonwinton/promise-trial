export default function (...args) {
  if (!args || !args.length) {
    throw new Error('Promise-Trial: At least one entry is required to test.');
  }

  return new Promise((resolve, reject) => {
    var count = args.length,
    resolvedData = [],
    rejected = [],
    completed = 0,
    i = 0,
    item = null;

    for (i; i < count; i++) {
      // Alias current item
      item = args[i];

      if (!item.promise || !item.comparitor) {
        reject(new Error(`Promise-Trial: argument at index ${i} must contain a 'promise' and 'comparitor' argument`));
      }

      item.promise
        .then(function (i, resp) {
          if (!item.comparitor(resp)) {
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
        .catch(function(index, e) {
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
