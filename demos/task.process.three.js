module.exports = async function taskthree(resultsContext) {
    const parallelResults = resultsContext.parallel_block_1; 
    const resultOne = parallelResults['demos/task.process.one.js']; // Accessing by file path key
    const resultTwo = parallelResults['demos/task.process.two.js']; 
    
    console.log(`[Worker - demos/task.process.three.js] Started. Combining: ${resultOne} and ${resultTwo}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    const finalProcessing = resultOne + resultTwo;
    
    console.log(`[Worker - demos/task.process.three.js] Finished. Final combined value: ${finalProcessing}`);
    return finalProcessing;
};