module.exports = async function taskthree(resultsMap){
    console.log(`\n--- STEP: Starting Sequential task: testtwo ---`);
    const threeResult = resultsMap.get('taskpath_three');
    console.log(`testtwo accessed parallel result 'taskpath_three': ${threeResult.substring(0, 20)}...`);
    await new Promise(resolve => setTimeout(resolve, 50)); 
    return `Result E: Final check after parallel tasks.`;
};