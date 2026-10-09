/**
 *
 * Reldens - UnitTestMethodRunner
 *
 */

class UnitTestMethodRunner
{

    constructor(testedClassName)
    {
        this.testedClassName = testedClassName;
        this.results = {total: 0, passed: 0, failed: 0};
    }

    test(name, testFn)
    {
        this.results.total++;
        try{
            testFn();
            this.results.passed++;
            process.stdout.write('PASS: '+name+'\n');
        } catch(error){
            this.results.failed++;
            process.stdout.write('FAIL: '+name+' - '+error.message+'\n');
        }
    }

    async runAllTests()
    {
        process.stdout.write('Running tests for '+this.testedClassName+'...\n\n');
        let testMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(
            name => name.startsWith('test'+this.testedClassName)
        );
        for(let methodName of testMethods){
            await this[methodName]();
        }
        process.stdout.write(
            '\n'+this.testedClassName.toUpperCase()+' TEST SUMMARY - Total: '+this.results.total
            +' | Passed: '+this.results.passed
            +' | Failed: '+this.results.failed+'\n'
        );
        return this.results;
    }

}

module.exports.UnitTestMethodRunner = UnitTestMethodRunner;
