module.exports = async function taskone(resultsContext) {
    const input = resultsContext.initialData;
    console.log(`[Worker - demos/task.process.one.js] Started with initialData: ${input}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    const result = input + 50;
    console.log(`[Worker - demos/task.process.one.js] Finished. Result: ${result}`);
    return result;
};