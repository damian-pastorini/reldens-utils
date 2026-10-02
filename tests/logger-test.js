/**
 *
 * Reldens - TestLogger
 *
 */

const assert = require('assert');
const { spawnSync } = require('child_process');
const Logger = require('../lib/logger');

class TestLogger
{

    constructor()
    {
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
        process.stdout.write('Running tests for Logger...\n\n');
        let testMethods = Object.getOwnPropertyNames(TestLogger.prototype).filter(name => name.startsWith('testLogger'));
        for(let methodName of testMethods){
            await this[methodName]();
        }
        process.stdout.write(
            '\nLOGGER TEST SUMMARY - Total: '+this.results.total
            +' | Passed: '+this.results.passed
            +' | Failed: '+this.results.failed+'\n'
        );
        return this.results;
    }

    runLoggerScript(scriptBody)
    {
        return spawnSync(
            process.execPath,
            ['-e', 'const logger = require("./lib/logger"); logger.setLogLevel(7); logger.setAddTimeStamp(false);'+scriptBody],
            {encoding: 'utf8', cwd: process.cwd()}
        );
    }

    testLoggerPrintToConsoleIsEnabledByDefault()
    {
        this.test('printToConsole is enabled by default', () => {
            assert.strictEqual(new Logger.constructor().printToConsole, true);
        });
    }

    testLoggerSetPrintToConsoleReturnsTheLogger()
    {
        this.test('setPrintToConsole sets the value and returns the logger', () => {
            let logger = new Logger.constructor();
            assert.strictEqual(logger.setPrintToConsole(false), logger);
            assert.strictEqual(logger.printToConsole, false);
        });
    }

    testLoggerPrintsToConsoleByDefault()
    {
        this.test('a log line is printed to the console by default', () => {
            let result = this.runLoggerScript('logger.info("default-console-line");');
            assert.strictEqual(-1 !== result.stdout.indexOf('default-console-line'), true);
        });
    }

    testLoggerCallbackReceivesTheLineWithoutConsole()
    {
        this.test('with printToConsole disabled the callback receives the line and the console does not', () => {
            let result = this.runLoggerScript(
                'logger.setPrintToConsole(false);'
                +'logger.callback = (...args) => process.stderr.write("callback:"+args.join(" "));'
                +'logger.info("callback-only-line");'
            );
            assert.strictEqual(-1 === result.stdout.indexOf('callback-only-line'), true);
            assert.strictEqual(-1 !== result.stderr.indexOf('callback:INFO - callback-only-line'), true);
        });
    }

}

module.exports.TestLogger = TestLogger;
