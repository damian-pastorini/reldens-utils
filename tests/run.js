console.log('Running all tests...\n');

try{
    /*
    console.log('='.repeat(60));
    console.log('TESTING OLD IMPLEMENTATION');
    console.log('='.repeat(60));
    require('./test-old.js');

    console.log('\n\n');
    */
    console.log('='.repeat(60));
    console.log('TESTING NEW IMPLEMENTATION');
    console.log('='.repeat(60));
    require('./test-new.js');

    console.log('\n\nAll tests completed successfully!');
} catch(error){
    console.error('\nTest execution failed:', error.message);
    process.exit(1);
}
