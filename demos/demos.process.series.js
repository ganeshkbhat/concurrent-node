async function main() {
    console.log('==================================================');
    console.log('🚀 Starting Workflow (All results tracked)');
    console.log('==================================================');

    const workflow = [
        'demos/task.process.one.js',                     
        ['demos/task.process.one.js', 'demos/task.parallel.two.js'],
        'demos/task.process.three.js'
    ];
    
    const initialContext = {
        initialData: 10,
        // Let's deliberately cause an error in a task by passing a bad variable
        badVariable: null 
    };

    try {
        const finalContext = await runSeries(workflow, initialContext);
        
        console.log('\n==================================================');
        console.log('✅ Workflow Complete - FINAL RESULTS CONTEXT');
        console.log('==================================================');
        
        // Log the final object, which contains all executed results.
        console.log(JSON.stringify(finalContext, null, 2));

        // Display a summary table of all executed steps
        console.log('\n--- Execution Summary ---');
        for (const key in finalContext) {
            if (key === 'initialData' || key.startsWith('__')) continue;
            
            const result = finalContext[key];
            const isError = result && result.__error__;
            const status = isError ? `❌ FAILURE: ${result.message.substring(0, 30)}...` : '🟢 SUCCESS';
            
            if (key.startsWith('parallel_block')) {
                const subTasks = Object.keys(result).filter(k => !result[k].__error__).length;
                console.log(`- **${key}**: ${status} (${subTasks} subtasks successful)`);
            } else {
                console.log(`- **${key}**: ${status}`);
            }
        }
        console.log('-------------------------');

    } catch (error) {
        // This catch block should realistically never be hit since errors are handled internally
        console.error('\n❌ CRITICAL WORKFLOW FAILURE:', error.message);
    }
}

main();