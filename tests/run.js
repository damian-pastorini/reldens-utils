console.log('Running all tests...\n');

async function runTests(){
    console.log('='.repeat(60));
    console.log('TESTING IMPLEMENTATION');
    console.log('='.repeat(60));
    let suites = [];
    const { TestShortcuts } = require('./shortcuts-test.js');
    suites.push(await (new TestShortcuts()).runAllTests());
    const { TestEventsManager } = require('./events-manager-test.js');
    suites.push(await (new TestEventsManager()).runAllTests());
    let totalTests = suites.reduce((sum, s) => sum + s.total, 0);
    let totalPassed = suites.reduce((sum, s) => sum + s.passed, 0);
    let totalFailed = suites.reduce((sum, s) => sum + s.failed, 0);
    console.log('\n'+'='.repeat(60));
    console.log('FINAL TOTAL');
    console.log('='.repeat(60));
    console.log('Total: '+totalTests+' | Passed: '+totalPassed+' | Failed: '+totalFailed);
    console.log('='.repeat(60));
    if(0 < totalFailed){
        process.exit(1);
    }
}

runTests().catch(error => {
    console.error('\nTest execution failed:', error.message);
    process.exit(1);
});
