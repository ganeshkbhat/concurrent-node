module.exports = async function tasktwo(resultsContext) {
    const input = resultsContext['demos/task.process.one.js'];
    console.log(`[Worker - demos/task.process.two.js] Started. Using task_one result: ${input}`);
    // await new Promise(resolve => setTimeout(resolve, 100)); 
    const result = input + 100;
    console.log(`[Worker - demos/task.process.two.js] Finished. Result: ${result}`);
    return result;
};