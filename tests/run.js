console.log('Running all tests...\n');

async function runTests(){
    console.log('='.repeat(60));
    console.log('TESTING IMPLEMENTATION');
    console.log('='.repeat(60));
    const { TestEventsManager } = require('./events-manager-test.js');
    let testInstance = new TestEventsManager();
    await testInstance.runAllTests();
}

runTests().catch(error => {
    console.error('\nTest execution failed:', error.message);
    process.exit(1);
});
