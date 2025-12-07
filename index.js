
const { Worker } = require('worker_threads');
const path = require('path'); // Node.js built-in module for path manipulation

/**
 * Executes a task flow with a shared, persistent results map.
 * @param {Array<string | Array<string>>} taskFlow - Defines the execution order.
 * @returns {Promise<Map>} The final results map containing all task outputs.
 */
async function runPromiseTaskFlow(taskFlow, tasks) {
    // Central store for all results
    const resultsMap = new Map();
    
    // Iterate through the main flow array (each item is a step)
    for (const step of taskFlow) {
        if (Array.isArray(step)) {
            // --- PARALLEL EXECUTION ---
            console.log(`\n--- STEP: Starting Parallel tasks: ${step.join(', ')} ---`);

            // 1. Map tasks to promises, ensuring each gets the CURRENT resultsMap
            const promises = step.map(taskName => {
                const taskFunction = tasks[taskName];
                if (!taskFunction) throw new Error(`Unknown parallel task: ${taskName}`);
                // Each function call is a promise (or returns immediately if sync)
                // They all receive the SAME resultsMap
                return taskFunction(resultsMap); 
            });

            // 2. Wait for all parallel promises to resolve
            const parallelResults = await Promise.all(promises);
            
            // 3. Update the resultsMap with the collected parallel results
            step.forEach((taskName, index) => {
                resultsMap.set(taskName, parallelResults[index]);
            });
            
            console.log(`Parallel tasks finished. Added ${step.length} results.`);

        } else if (typeof step === 'string') {
            // --- SEQUENTIAL EXECUTION ---
            console.log(`\n--- STEP: Starting Sequential task: ${step} ---`);

            const taskName = step;
            const taskFunction = tasks[taskName];
            if (!taskFunction) throw new Error(`Unknown sequential task: ${taskName}`);

            // 1. Execute the function (passes the current resultsMap)
            const sequentialResult = await taskFunction(resultsMap);
            
            // 2. Update the resultsMap with the result of this single task
            resultsMap.set(taskName, sequentialResult);
            console.log(`Sequential task ${taskName} finished. Result added.`);

        } else {
            throw new Error("Invalid task flow step. Must be a string or an array of strings.");
        }
    }

    return resultsMap; // The final result is the complete Map
}

module.exports.runPromiseTaskFlow = runPromiseTaskFlow;


function runInThreadWorker(taskName, taskFilePath, resultsMap) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./worker.js');
        
        // Convert Map data for transmission
        const resultsArray = Array.from(resultsMap.entries());

        // Send file path and data to the worker
        worker.postMessage({ 
            taskName, 
            taskFilePath, 
            resultsMap: resultsArray 
        });

        // Handler for success
        worker.on('message', (message) => {
            resolve(message); 
            // Crucial: Terminate the worker once the result is received
            worker.terminate(); 
        });

        // Handler for errors
        worker.on('error', (err) => {
            reject(err);
            // Crucial: Terminate the worker on error
            worker.terminate();
        });
        
        // Alternative approach for termination (useful if message/error listeners fail)
        // worker.on('exit', (code) => {
        //     if (code !== 0) {
        //         // This handles cases where the worker is terminated externally or crashes
        //     }
        //     // Note: If you resolve/reject and call terminate above, this is redundant.
        //     // But keeping it can provide robustness.
        // });
    });

}

// Worker thread setup (with termination fix)
function runInThreadWorker(taskName, taskFilePath, resultsMap) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./worker.js');
        const resultsArray = Array.from(resultsMap.entries());

        worker.postMessage({ taskName, taskFilePath, resultsMap: resultsArray });

        // Crucial: Termination ensures the main process exits
        worker.on('message', (message) => {
            worker.terminate(); 
            resolve(message); 
        });
        worker.on('error', (err) => {
            worker.terminate();
            reject(err);
        });
        // You can also listen for 'exit' for maximum robustness, but message/error handles 99% of cases.
    });
}

module.exports.runInThreadWorker = runInThreadWorker;

// Helper function to resolve the function reference
function resolveTaskFunction(taskName) {
    const taskReference = taskResolverMap[taskName];

    if (!taskReference) {
        throw new Error(`Unknown task or path reference: ${taskName}`);
    }

    if (typeof taskReference === 'function') {
        // Case 1: Already a function reference (in-memory sequential task)
        return taskReference;
    } else if (typeof taskReference === 'string') {
        // Case 2: It's a file path string. Use require() to load the exported function.
        try {
            console.log(`[Resolver] Loading function from file: ${taskReference}`);
            // Note: require() caches the result, so subsequent calls are fast.
            return require(taskReference);
        } catch (error) {
            console.error(`Failed to load task from path ${taskReference}: ${error.message}`);
            throw error;
        }
    } else {
        throw new Error(`Invalid reference type for task ${taskName}.`);
    }
}

// Helper function to resolve the function reference (Handles in-memory or file loading)
function resolveTaskFunction(taskName) {
    const taskReference = taskResolverMap[taskName];

    if (typeof taskReference === 'function') {
        return taskReference; // It's an in-memory function
    } else if (typeof taskReference === 'string') {
        // It's a file path string. Use require() to load the exported function.
        try {
            console.log(`[Resolver] Loading function from file: ${taskReference}`);
            return require(taskReference); // Load the module
        } catch (error) {
            console.error(`Failed to load sequential task from path ${taskReference}. Error:`, error.message);
            throw error;
        }
    } else {
        throw new Error(`Task reference for ${taskName} is invalid.`);
    }
}

// async function runThreadTaskFlow(taskFlow, sequentialTasks, parallelTaskPaths) {
//     const resultsMap = new Map();
    
//     for (const step of taskFlow) {
//         if (Array.isArray(step)) {
//             // --- PARALLEL EXECUTION (Worker Threads via File Path) ---
//             console.log(`\n--- STEP: Starting Parallel Worker Tasks: ${step.join(', ')} ---`);

//             const workerPromises = step.map(taskName => {
//                 const taskFilePath = taskResolverMap[taskName]; 
//                 if (!taskFilePath || typeof taskFilePath !== 'string') throw new Error(`Parallel task ${taskName} must be a file path string.`);
//                 return runInThreadWorker(taskName, taskFilePath, resultsMap);
//             });

//             const workerResults = await Promise.all(workerPromises);
            
//             workerResults.forEach(({ taskName, result }) => {
//                 resultsMap.set(taskName, result);
//             });
            
//         } else if (typeof step === 'string') {
//             // --- SEQUENTIAL EXECUTION (Now handles path loading) ---
//             const taskName = step;
            
//             // Resolve the function (either in-memory or loaded from path)
//             const taskFunction = resolveTaskFunction(taskName);

//             console.log(`\n--- STEP: Starting Sequential task: ${taskName} ---`);

//             // Execute the function
//             const sequentialResult = await taskFunction(resultsMap);
//             resultsMap.set(taskName, sequentialResult);
//             console.log(`Sequential task ${taskName} finished. Result added.`);
//         }
//     }

//     return resultsMap;
// }

async function runThreadTaskFlow(taskFlow, sequentialTasks, parallelTaskPaths) {
    const resultsMap = new Map();
    
    for (const step of taskFlow) {
        if (Array.isArray(step)) {
            // --- PARALLEL EXECUTION (WORKER THREADS via File Path) ---
            console.log(`\n--- STEP: Starting Parallel Worker Tasks: ${step.join(', ')} ---`);

            const workerPromises = step.map(taskName => {
                const taskFilePath = parallelTaskPaths[taskName];
                if (!taskFilePath) throw new Error(`Unknown parallel task or missing path: ${taskName}`);
                return runInThreadWorker(taskName, taskFilePath, resultsMap);
            });

            const workerResults = await Promise.all(workerPromises);
            
            workerResults.forEach(({ taskName, result }) => {
                resultsMap.set(taskName, result);
                console.log(`[Main Thread] Collected result for ${taskName}`);
            });
            
        } else if (typeof step === 'string') {
            // --- SEQUENTIAL EXECUTION (Main Thread) ---
            const taskName = step;
            const taskFunction = sequentialTasks[taskName] ? sequentialTasks[taskName] : require(taskName);
            if (!taskFunction) throw new Error(`Unknown sequential task: ${taskName}`);

            const sequentialResult = await taskFunction(resultsMap);
            resultsMap.set(taskName, sequentialResult);
            console.log(`Sequential task ${taskName} finished. Result added.`);
        } else {
            throw new Error("Invalid task flow step.");
        }
    }

    return resultsMap;
}

module.exports.runThreadTaskFlow = runThreadTaskFlow;





