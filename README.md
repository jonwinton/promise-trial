# promise-trial

> Execute a batch of Promises and test them as they come in. Exit quickly when one fails rather than waiting for all to resolve.

Useful for it you have a bunch of asynchronous actions you need to execute and you want to test the response of each, but if one of the tests fails you want to know immediately rather than waiting on all to resolve.

This differs from `Promise.all` which waits for _all_ tests to complete before continuing, or `Promise.race` which only accepts the _first_ that returns.


# Install

```
npm install --save promise-trial
```

# Usage

The module accepts an Array of Objects which _must_ contain two properties: `promise` and `comparitor`. The `promise` key should have a corresponsing Promise value and the `comparitor` should be a function which returns a Boolean based on the Promise's resolved value. An example object might look like:

```javascript
var myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(2);
  }, 200);
});

function myComparitor(arg) {
  return arg % 2 === 0;
}

var myTrialObject = {
  promise: myPromise,
  comparitor: myComparitor
};
```
Once you have your object(s) setup you pass them in to the trial function as demonstrated below. You can pass in any number of objects for testing in a batch.

```javascript
import trial from 'promise-trial';

trial([myTrialObject])
  .then(resp => {
    // Perform application logic
    // after test completes
  });
```
This example only has one Promise to test, but it will resolve to `true` and then the application can proceed.

# Responses

The `trial` function returns a Promise which will resolve in one of three ways:

- All test comparitors returns `true`, the trial will `resolve`
- One or more tests were rejected but some could complete, the trial will `resolve`
- A comparitor returned `false`, the trial will `resolve`


### Passing Response

If all the tests pass or if at least one Promise rejects, the response object will look be the following object:
```javascript
{
  count: <Number>       // The number of items tested
  resolvedData: <Array> // An array of all data resolved from the Promises
  rejected: <Array>     // An array of all rejected Promises with their Error object
  passed: <Boolean>     // A boolean whose value will be `true` since all tests passed
}
```
This object contains all the necessary to carry on application logic. All data in the `resolvedData` array mirrors the order of the array passed in to the trial. For any trial that rejects a `null` value will fill in at the proper index of `resolvedData`.

### Failing Response

Whenever a `comparitor` returns `false` the trial will immediately resolve and so that your application can proceed quickly rather than waiting for all Promises to resolve. The response object for a failing test is simple:
```javascript
{
  passed: <Boolean>     // A boolean set to `false`
  failedIndex: <Number> // The index of the failed test
}
```

### Rejection
A trial will not `reject` unless a malformed test object is passed in. Ensure that your objects contain two the `promise` and `comparitor` properties

# Contribution
Creat a pull request with a failing unit test, and I'll gladly help fix it
