# concurrentjs
run functions concurrently in workers and thread pool

all demos are in the [demo folder](https://github.com/ganeshkbhat/concurrent-node/tree/main/demos)

##### promise based concurrency
```
var tasks= {}

// resultsMap gives access to results within the function
function testfour(resultsMap) {
    console.log(`\nStarting testfour. Current map size: ${resultsMap.size}`);

    return "Result D: Parallel Task Two.";
}
tasks.testfour = testfour;

// other functions tasks.testone, tasks.testtwo, tasks.testthree, tasks.testfour   

const taskSpecification = [
    "testone",      // 1. Sequential: Initializes resultsMap with 'testone' result.
    ["testthree", "testfour"], // 2. Parallel: Both can access 'testone' result. Adds 'testthree' and 'testfour' results.
    "testtwo"       // 3. Sequential: Can access 'testone', 'testthree', and 'testfour' results.
];

const finalResults = await runPromiseTaskFlow(taskSpecification, tasks);

console.log(finalResults);


```

##### process based concurrency

```
// resultsMap gives access to results within the function
//
// demos/task.process.one.js below
//
// function testfour(resultsMap) {
//    console.log(`\nStarting testfour. Current map size: ${resultsMap.size}`);
//
//    return "Result D: Parallel Task Two.";
// }
//
const workflow = [
        'demos/task.process.one.js',                     
        ['demos/task.process.two.js', 'demos/task.process.three.js'], // Parallel block
        'demos/task.process.four.js'
    ];

const initialContext = {
        initialData: 10,
    };

const finalContext = await runSeriesInProcess(workflow, initialContext);
        
console.log(finalContext);

```

##### thread based concurrency

```

// resultsMap gives access to results within the function

const sequentialTasks = {
    testone: (resultsMap) => {
        console.log(`\n--- STEP: Starting Sequential task: testone ---`);
        return "Result A: First task complete.";
    },
    testtwo: async (resultsMap) => {
        console.log(`\n--- STEP: Starting Sequential task: testtwo ---`);
        const threeResult = resultsMap.get('testthree');
        console.log(`testtwo accessed parallel result 'testthree': ${threeResult.substring(0, 20)}...`);
        await new Promise(resolve => setTimeout(resolve, 50));
        return `Result E: Final check after parallel tasks.`;
    }
};

// Map parallel task names to their FILE PATHS
const parallelTaskPaths = {
    testthree: path.resolve(__dirname, './taskthree.js'),
    testfour: path.resolve(__dirname, './taskfour.js')
};

const taskSpecification = [
    "testone",
    ["testthree", "testfour"], // These map to the files in the 'tasks' directory
    "testtwo"
];

const finalResults = await runThreadTaskFlow(taskSpecification, sequentialTasks, parallelTaskPaths);

console.log(finalResults);

```