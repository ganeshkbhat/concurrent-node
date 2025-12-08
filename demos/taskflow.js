
const { runPromiseTaskFlow, runThreadTaskFlow, runInThreadWorker, runSeriesInProcess, runParallelInProcess } = require("../../concurrent-node/index")
const path = require('path'); // Node.js built-in module for path manipulation

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


/**
 * Another parallel-friendly task.
 */
function testfive(resultsMap) {
    console.log(`\nStarting testfour. Current map size: ${resultsMap.size}`);

    return 20;
}
tasks.testfive = testfive;


// --- 3. Define the specification and run ---

const taskSpecification = [
    "testone",      // 1. Sequential: Initializes resultsMap with 'testone' result.
    ["testthree", "testfour", "testfive"], // 2. Parallel: Both can access 'testone' result. Adds 'testthree' and 'testfour' and 'testfive' results.
    "testtwo"       // 3. Sequential: Can access 'testone', 'testthree', 'testfive' and 'testfour' results.
];


// Map parallel task names to their FILE PATHS
const parallelTaskPaths = {
    testthree: path.resolve(__dirname, '../demos/taskthree.js'),
    testfour: path.resolve(__dirname, '../demos/taskfour.js'),
    testfive: path.resolve(__dirname, '../demos/task.process.four.js')
};


// Map parallel task names to their FILE PATHS
const parallelProcessTaskPaths = [
    '../demos/taskthree.js',  
    '../demos/tasktwo.js',  
    ["../demos/taskthree.js", './demos/taskfour.js', './demos/task.process.one.js'], 
    '../demos/taskone.js'
]



var finalResults

async function main() {
    finalResults = await runPromiseTaskFlow(taskSpecification, tasks);
    console.log("finalResults: async: ", finalResults)

    // finalResults = await runThreadTaskFlow(taskSpecification, tasks, parallelTaskPaths);
    // console.log("finalResults: threads: ", finalResults)

    // finalResults = await runSeriesInProcess(parallelProcessTaskPaths, {});
    // console.log("finalResults: process: ", JSON.stringify(finalResults))

}

main()



