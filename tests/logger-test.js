/**
 *
 * Reldens - TestLogger
 *
 */

const assert = require('assert');
const { spawnSync } = require('child_process');
const Logger = require('../lib/logger');
const { UnitTestMethodRunner } = require('./unit-test-method-runner');

class TestLogger extends UnitTestMethodRunner
{

    constructor()
    {
        super('Logger');
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
