console.log('Running all tests...\n');

try{
    console.log('='.repeat(60));
    console.log('TESTING NEW IMPLEMENTATION');
    console.log('='.repeat(60));
    require('./events-manager-test.js');

    console.log('\n\nAll tests completed successfully!');
} catch(error){
    console.error('\nTest execution failed:', error.message);
    process.exit(1);
}
