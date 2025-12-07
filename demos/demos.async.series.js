
const { runPromiseTaskFlow } = require("../../concurrent-node-/index")

// Map to hold all task functions
const tasks = {};

/**
 * Task signature: (resultsMap) => result
 * @param {Map} resultsMap - Contains the results of all tasks run so far.
 * @returns {any} The result of this specific task.
 */
function testone(resultsMap) {
    console.log(`\nStarting testone. Current map size: ${resultsMap.size}`);

    // Example access:
    // const prevResult = resultsMap.get('previous_task_name'); 

    return "Result A: First task complete.";
}
tasks.testone = testone;

/**
 * Async task that accesses prior results.
 */
async function testtwo(resultsMap) {
    console.log(`\nStarting testtwo. Current map size: ${resultsMap.size}`);

    // Accessing results from testone
    const oneResult = resultsMap.get('testone');
    console.log(`testtwo accessed testone result: ${oneResult}`);

    // Simulate async work
    await new Promise(resolve => setTimeout(resolve, 50));

    return `Result B: Processed '${oneResult}'.`;
}
tasks.testtwo = testtwo;

/**
 * Parallel-friendly task.
 */
function testthree(resultsMap) {
    console.log(`\nStarting testthree. Current map size: ${resultsMap.size}`);

    // This task runs in parallel with another, both accessing the same current map
    return "Result C: Parallel Task One.";
}
tasks.testthree = testthree;

/**
 * Another parallel-friendly task.
 */
function testfour(resultsMap) {
    console.log(`\nStarting testfour. Current map size: ${resultsMap.size}`);

    return "Result D: Parallel Task Two.";
}
tasks.testfour = testfour;


// --- 3. Define the specification and run ---

const taskSpecification = [
    "testone",      // 1. Sequential: Initializes resultsMap with 'testone' result.
    "testtwo"       // 3. Sequential: Can access 'testone', 'testthree', and 'testfour' results.
];

(async () => {
    try {
        console.log("--- Starting Task Flow Execution ---");
        const finalResults = await runPromiseTaskFlow(taskSpecification, tasks);

        console.log("\n==============================");
        console.log("✅ All tasks completed.");
        console.log("Final Result (Complete Map):");
        console.log(finalResults);
        console.log("==============================");
    } catch (error) {
        console.error("❌ Task Flow Failed:", error.message);
    }
})();


