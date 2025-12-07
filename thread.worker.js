const { parentPort } = require('worker_threads');

// Listen for the message from the main thread
parentPort.on('message', async (workerData) => {
    const { 
        taskName, 
        taskFilePath, // The path to the file containing the task function
        resultsMap: resultsArray 
    } = workerData;
    
    const resultsMap = new Map(resultsArray);
    
    let result;
    try {
        console.log(`[Worker ${taskName}] Loading and executing task from file: ${taskFilePath}`);

        // SAFE STEP: Use require() to load the exported function
        const taskFunction = require(taskFilePath);

        // Execute the loaded function
        result = await taskFunction(resultsMap); 
        
    } catch (error) {
        console.error(`[Worker ${taskName}] Execution failed:`, error.message);
        result = `ERROR: ${error.message}`;
    }

    // Send the result back to the main thread
    parentPort.postMessage({ taskName, result });
});

