// process.worker.js

const path = require('path');

// Listener for messages from the parent process
process.on('message', async (message) => {
    // Renamed functionName to functionPath in the previous step
    const { taskId, functionPath, args } = message; 
    let taskFunction;

    try {
        // Resolve the path relative to the process.worker.js file
        const resolvedPath = path.resolve(__dirname, functionPath);
        
        // Dynamically load the module (task function)
        taskFunction = require(resolvedPath);
        
        if (typeof taskFunction !== 'function') {
             throw new Error(`Module ${functionPath} does not export a valid function.`);
        }

    } catch (error) {
        // Send error back if file loading failed (e.g., file not found, bad export)
        process.send({ taskId, status: 'error', error: `Function loading failed: ${error.message}` });
        return;
    }
    
    // Execute the dynamically loaded function
    try {
        // The worker function receives the full resultsContext (inside args)
        const result = await taskFunction(args); 

        // Send the successful result back to the parent
        process.send({ taskId, status: 'success', result });
    } catch (error) {
        // Send error back if execution failed
        process.send({ taskId, status: 'error', error: `Execution error: ${error.message}` });
    }
});