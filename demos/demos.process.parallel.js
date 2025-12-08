
const {runTaskInProcessWorker, runParallelInProcess, runSeriesInProcess } = require("../index.js")

async function main() {
    console.log('==================================================');
    console.log('🚀 Starting File Path Loaded taskSpecification');
    console.log('==================================================');

    // The taskSpecification now uses file paths (relative to main.js)
    const taskSpecification = [
        'demos/task.process.one.js',                     
        ['demos/task.process.two.js', 'demos/task.process.three.js'], // Parallel block
        'demos/task.process.four.js'
    ];
    
    const initialContext = {
        initialData: 10,
    };

    try {
        const finalContext = await runSeriesInProcess(taskSpecification, initialContext);
        
        console.log('\n==================================================');
        console.log('✅ Workflow Complete');
        console.log('FINAL CONTEXT (All Results):');
        console.log(finalContext);
        console.log('==================================================');
    } catch (error) {
        console.error('\n❌ Workflow failed:', error.message);
    }
}

main();