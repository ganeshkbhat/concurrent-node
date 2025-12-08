// tasks/test_error.js
module.exports = function testError(resultsMap) {
    // Synchronously throw an error inside the worker thread
    throw new Error("Simulated worker failure!");
};