// tasks/testthree.js
module.exports = function testthree(resultsMap) {
    // CPU-intensive task simulation
    let count = 0;
    for (let i = 0; i < 1e7; i++) { count++; }
    return `Result C: CPU Task One finished. Count: ${count}.`;
};