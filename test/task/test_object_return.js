// tasks/test_object_return.js
module.exports = function testObjectReturn(resultsMap) {
    const previousResult = resultsMap.get('testone');
    return { 
        success: true, 
        inputEcho: previousResult, 
        timestamp: Date.now() 
    };
};