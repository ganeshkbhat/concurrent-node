module.exports = async function taskfour(resultsContext) {
    const input = resultsContext.initialData;
    console.log(`[Worker - demos/task.process.four.js] Started with initialData: ${input}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    const result = input + 50;
    console.log(`[Worker - demos/task.process.four.js] Finished. Result: ${result}`);
    return result;
};