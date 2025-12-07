const { runThreadTaskFlow, runInThreadWorker } = require("../../concurrent-node/index")

const path = require('path'); // Node.js built-in module for path manipulation

// --- A. Define Sequential Tasks (Main Thread) ---
const sequentialTasks = {
    testone: (resultsMap) => {
        console.log(`\n--- STEP: Starting Sequential task: testone ---`);
        return "Result A: First task complete.";
    },
    testtwo: async (resultsMap) => {
        console.log(`\n--- STEP: Starting Sequential task: testtwo ---`);
        const threeResult = resultsMap.get('testthree');
        console.log(`testtwo accessed parallel result 'testthree': ${threeResult.substring(0, 20)}...`);
        await new Promise(resolve => setTimeout(resolve, 50));
        return `Result E: Final check after parallel tasks.`;
    }
};

// Map parallel task names to their FILE PATHS
const parallelTaskPaths = {
    testthree: path.resolve(__dirname, './taskthree.js'),
    testfour: path.resolve(__dirname, './taskfour.js')
};

// --- C. Define the specification and run ---

const taskSpecification = [
    "testone",
    ["testthree", "testfour"], // These map to the files in the 'tasks' directory
    "testtwo"
];

(async () => {
    try {
        console.log("--- Starting Task Flow Execution ---");
        const finalResults = await runThreadTaskFlow(taskSpecification, sequentialTasks, parallelTaskPaths);

        console.log("\n==============================");
        console.log("✅ All tasks completed.");
        console.log("Final Result (Complete Map):");
        console.log(finalResults);
        console.log("==============================");
    } catch (error) {
        console.error("❌ Task Flow Failed:", error.message);
    }
})();