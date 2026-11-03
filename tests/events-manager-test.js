/**
 *
 * Reldens - TestEventsManager
 *
 */

const EventsManager = require('../lib/events-manager');

class TestEventsManager
{

    constructor()
    {
        this.testResults = [];
        this.testCount = 0;
        this.passedCount = 0;
        this.currentTestMethod = '';
        this.pendingTests = [];
    }

    test(name, testFn)
    {
        this.testCount++;
        this.pendingTests.push(this.runTest(name, testFn));
    }

    async runTest(name, testFn)
    {
        try{
            await testFn();
            let logMessage = '✓ PASS: '+this.currentTestMethod+' - '+name;
            console.log(logMessage);
            this.passedCount++;
            this.testResults.push({name, status: 'PASS'});
        } catch(error){
            let logMessage = '✗ FAIL: '+this.currentTestMethod+' - '+name+' - '+error.message;
            console.log(logMessage);
            this.testResults.push({name, status: 'FAIL', error: error.message});
        }
    }

    assert(condition, message)
    {
        if(!condition){
            throw new Error(message || 'Assertion failed');
        }
    }

    async runAllTests()
    {
        console.log('Running tests for EventsManager...\n');
        let methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
        let testMethods = methodNames.filter(name =>
            name.startsWith('test') &&
            'function' === typeof this[name] &&
            name !== 'test'
        );
        for(let methodName of testMethods){
            this.currentTestMethod = methodName;
            try{
                await this[methodName]();
                await Promise.all(this.pendingTests);
            } catch(error){
                console.error('Test method failed:', methodName, error.message);
            }
            this.pendingTests = [];
        }
        let failed = this.printSummary();
        return {total: this.testCount, passed: this.passedCount, failed};
    }

    testConstructorCreatesInstance()
    {
        this.test('Constructor creates instance', () => {
            let emitter = new EventsManager();
            this.assert(emitter instanceof EventsManager, 'Should create instance');
            this.assert('object' === typeof emitter._events, 'Should have _events object');
            this.assert('object' === typeof emitter.eventsByRemoveKeys, 'Should have eventsByRemoveKeys object');
            this.assert(false === emitter.debug, 'Should have debug false by default');
        });
    }

    testStaticTypeKeyName()
    {
        this.test('Constructor initializes typeKeyName property', () => {
            let emitter = new EventsManager();
            this.assert('undefined' !== typeof emitter.typeKeyName, 'Should have typeKeyName property');
            this.assert('string' === typeof emitter.typeKeyName || 'symbol' === typeof emitter.typeKeyName, 'typeKeyName should be string or symbol');
            this.assert('undefined' !== typeof emitter.symbolString, 'Should have symbolString property');
            this.assert('--[[await-event-emitter]]--' === emitter.symbolString, 'Should have correct symbolString value');
        });
    }

    testConstructorUsesShortcutsForSymbolCheck()
    {
        this.test('Constructor uses shortcuts for Symbol function check', () => {
            let emitter = new EventsManager();
            if('function' === typeof Symbol){
                this.assert('symbol' === typeof emitter.typeKeyName, 'Should create symbol when Symbol is available');
            }
            if('function' !== typeof Symbol){
                this.assert('string' === typeof emitter.typeKeyName, 'Should use string when Symbol not available');
            }
            this.assert(emitter.symbolString === emitter.typeKeyName || Symbol.for(emitter.symbolString) === emitter.typeKeyName, 'typeKeyName should match expected value');
        });
    }

    testTypeKeyNameUsedInListenerObjects()
    {
        this.test('typeKeyName property used correctly in listener objects', () => {
            let emitter = new EventsManager();
            let fn = () => {};

            emitter.on('type-key-test', fn);

            let eventArray = emitter._events['type-key-test'];
            this.assert(eventArray && eventArray.length > 0, 'Should have event listeners');

            let listenerObj = eventArray[0];
            this.assert(listenerObj.hasOwnProperty(emitter.typeKeyName), 'Listener should use typeKeyName property');
            this.assert('always' === listenerObj[emitter.typeKeyName], 'Should have correct listener type');
            this.assert(fn === listenerObj.fn, 'Should store correct function');
        });
    }

    testOnceListenerUsesTypeKeyName()
    {
        this.test('once listener uses typeKeyName correctly', () => {
            let emitter = new EventsManager();
            let fn = () => {};

            emitter.once('once-type-key-test', fn);

            let eventArray = emitter._events['once-type-key-test'];
            let listenerObj = eventArray[0];
            this.assert('once' === listenerObj[emitter.typeKeyName], 'Once listener should have correct type');
        });
    }

    testConstructorInitializesPerformanceFeatures()
    {
        this.test('Constructor initializes performance features', () => {
            let emitter = new EventsManager();
            this.assert('object' === typeof emitter._listenersCache, 'Should have _listenersCache object');
            this.assert(emitter._validationCache instanceof Map, 'Should have _validationCache Map');
            this.assert(null === emitter._debugPatterns, 'Should have _debugPatterns initially null');
            this.assert('string' === typeof emitter.symbolString, 'Should have symbolString property');
            this.assert('--[[await-event-emitter]]--' === emitter.symbolString, 'Should have correct symbolString');
            this.assert('undefined' !== typeof emitter.typeKeyName, 'Should have typeKeyName property');
        });
    }

    testListenersCachePerformance()
    {
        this.test('Listeners cache improves performance', () => {
            let emitter = new EventsManager();
            let fn = () => {};

            emitter.on('cache-test', fn);

            let firstCall = emitter.listeners('cache-test');
            let secondCall = emitter.listeners('cache-test');

            this.assert(firstCall === secondCall, 'Should return same cached array reference');
            this.assert(emitter._listenersCache['cache-test'], 'Should store cache entry');
        });
    }

    testValidationCachePerformance()
    {
        this.test('Validation cache improves performance', () => {
            let emitter = new EventsManager();

            let result1 = emitter.validateEventKey('test-key');
            let result2 = emitter.validateEventKey('test-key');

            this.assert(result1 === result2, 'Should return same validation result');
            this.assert(emitter._validationCache.has('test-key'), 'Should cache validation result');
            this.assert(emitter._validationCache.get('test-key') === result1, 'Should return cached value');
        });
    }

    testDebugPatternsOptimization()
    {
        this.test('Debug patterns optimization works', () => {
            let emitter = new EventsManager();
            emitter.debug = 'all,test,custom';

            emitter.logDebugEvent('test', 'Listen');

            this.assert(emitter._debugPatterns instanceof Set, 'Should create debug patterns Set');
            this.assert(emitter._debugPatterns.has('all'), 'Should contain all pattern');
            this.assert(emitter._debugPatterns.has('test'), 'Should contain test pattern');
            this.assert(emitter._debugPatterns.has('custom'), 'Should contain custom pattern');
        });
    }

    testCacheInvalidationOnRemoveListener()
    {
        this.test('Cache invalidation on removeListener', () => {
            let emitter = new EventsManager();
            let fn = () => {};

            emitter.on('cache-invalidate-test', fn);
            emitter.listeners('cache-invalidate-test');
            this.assert(emitter._listenersCache['cache-invalidate-test'], 'Should have cache entry');

            emitter.removeListener('cache-invalidate-test', fn);
            this.assert(!emitter._listenersCache['cache-invalidate-test'], 'Should clear cache on remove');
        });
    }

    testCacheInvalidationOnRemoveAllListeners()
    {
        this.test('Cache invalidation on removeAllListeners', () => {
            let emitter = new EventsManager();

            emitter.on('clear-cache-test1', () => {});
            emitter.on('clear-cache-test2', () => {});
            emitter.listeners('clear-cache-test1');
            emitter.listeners('clear-cache-test2');

            this.assert(emitter._listenersCache['clear-cache-test1'], 'Should have cache entry 1');
            this.assert(emitter._listenersCache['clear-cache-test2'], 'Should have cache entry 2');

            emitter.removeAllListeners();
            this.assert(0 === Object.keys(emitter._listenersCache).length, 'Should clear all cache entries');
        });
    }

    testCacheInvalidationOnOffWithKey()
    {
        this.test('Cache invalidation on offWithKey', () => {
            let emitter = new EventsManager();

            emitter.onWithKey('off-cache-test', () => {}, 'test-key');
            emitter.listeners('off-cache-test');
            this.assert(emitter._listenersCache['off-cache-test'], 'Should have cache entry');

            emitter.offWithKey('test-key');
            this.assert(!emitter._listenersCache['off-cache-test'], 'Should clear cache on offWithKey');
        });
    }

    testCacheInvalidationOnOffByMasterKey()
    {
        this.test('Cache invalidation on offByMasterKey', () => {
            let emitter = new EventsManager();

            emitter.onWithKey('master-cache-test1', () => {}, 'sub1', 'master');
            emitter.onWithKey('master-cache-test2', () => {}, 'sub2', 'master');
            emitter.listeners('master-cache-test1');
            emitter.listeners('master-cache-test2');

            this.assert(emitter._listenersCache['master-cache-test1'], 'Should have cache entry 1');
            this.assert(emitter._listenersCache['master-cache-test2'], 'Should have cache entry 2');

            emitter.offByMasterKey('master');
            this.assert(!emitter._listenersCache['master-cache-test1'], 'Should clear cache 1');
            this.assert(!emitter._listenersCache['master-cache-test2'], 'Should clear cache 2');
        });
    }

    testAssertTypeUsesShortcuts()
    {
        this.test('assertType uses shortcuts methods', () => {
            let emitter = new EventsManager();

            try{
                emitter.assertType(123);
                this.assert(false, 'Should throw error for number');
            } catch(error){
                this.assert(error instanceof TypeError, 'Should throw TypeError');
                this.assert(error.message.includes('type is not type of string or symbol'), 'Should have correct error message');
            }

            try{
                emitter.assertType('valid-string');
                this.assert(true, 'Should accept string');
            } catch(error){
                this.assert(false, 'Should not throw for valid string');
            }

            try{
                let sym = Symbol('test');
                emitter.assertType(sym);
                this.assert(true, 'Should accept symbol');
            } catch(error){
                this.assert(false, 'Should not throw for valid symbol');
            }
        });
    }

    testCheckMemoryLeaksMethod()
    {
        this.test('checkMemoryLeaks method works correctly', () => {
            let emitter = new EventsManager();
            let result = emitter.checkMemoryLeaks();
            this.assert(true === result, 'Should return true for low listener count');
            this.assert(false === emitter.hasLoggedMaxListeners, 'Should not have logged initially');
        });
    }

    testMaxListenersDebugLogOnce()
    {
        this.test('maxListeners debug log only once', () => {
            let emitter = new EventsManager();
            emitter.maxListeners = 5;
            let loggedMessages = [];
            let originalDebug = console.log;

            try{
                console.log = (...args) => loggedMessages.push(args.join(' '));
                process.env.RELDENS_LOG_LEVEL = 8;
                for(let i = 0; i < 10; i++){
                    emitter.on('test-max-'+i, () => {});
                }
            } finally{
                console.log = originalDebug;
                delete process.env.RELDENS_LOG_LEVEL;
            }

            let debugLogs = loggedMessages.filter(log => log.includes('High listener count detected'));
            this.assert(1 === debugLogs.length, 'Should log high listener count only once');
            this.assert(true === emitter.hasLoggedMaxListeners, 'Should set flag after logging');
        });
    }

    testCheckMemoryLeaksAfterFlagSet()
    {
        this.test('checkMemoryLeaks returns early after flag set', () => {
            let emitter = new EventsManager();
            emitter.hasLoggedMaxListeners = true;

            for(let i = 0; i < 20; i++){
                emitter.on('test-flag-'+i, () => {});
            }

            let result = emitter.checkMemoryLeaks();
            this.assert(true === result, 'Should return true immediately when flag is set');
        });
    }

    testConstructorInitializesLogFlag()
    {
        this.test('Constructor initializes hasLoggedMaxListeners flag', () => {
            let emitter = new EventsManager();
            this.assert(false === emitter.hasLoggedMaxListeners, 'Should initialize flag as false');
        });
    }

    testRemoveListenerUsesShortcuts()
    {
        this.test('removeListener uses shortcuts for function check', () => {
            let emitter = new EventsManager();
            let fn = () => {};

            emitter.on('shortcuts-test', fn);
            emitter.on('shortcuts-test', () => {});

            let result = emitter.removeListener('shortcuts-test', fn);
            this.assert(true === result, 'Should use sc.isFunction internally and work correctly');
        });
    }

    testSanitizeEventArgsWithValidArray()
    {
        this.test('sanitizeEventArgs with valid array', () => {
            let emitter = new EventsManager();
            let args = ['test', 123, {safe: 'data'}];
            let result = emitter.sanitizeEventArgs(args);
            this.assert(Array.isArray(result), 'Should return array');
            this.assert(3 === result.length, 'Should preserve array length');
        });
    }

    testSanitizeEventArgsWithNonArray()
    {
        this.test('sanitizeEventArgs with non-array returns empty array', () => {
            let emitter = new EventsManager();
            let result1 = emitter.sanitizeEventArgs(null);
            let result2 = emitter.sanitizeEventArgs('string');
            let result3 = emitter.sanitizeEventArgs(123);
            this.assert(Array.isArray(result1) && 0 === result1.length, 'Should return empty array for null');
            this.assert(Array.isArray(result2) && 0 === result2.length, 'Should return empty array for string');
            this.assert(Array.isArray(result3) && 0 === result3.length, 'Should return empty array for number');
        });
    }

    testSanitizeEventArgsExceedsMaxArgs()
    {
        this.test('sanitizeEventArgs when exceeding maxEventArgs', () => {
            let emitter = new EventsManager();
            emitter.maxEventArgs = 3;
            let args = [1, 2, 3, 4, 5];
            let result = emitter.sanitizeEventArgs(args);
            this.assert(Array.isArray(result) && 0 === result.length, 'Should return empty array when exceeding maxEventArgs');
        });
    }

    testFilterSensitiveDataWithNonObject()
    {
        this.test('filterSensitiveData with non-object returns input', () => {
            let emitter = new EventsManager();
            let result1 = emitter.filterSensitiveData('string');
            let result2 = emitter.filterSensitiveData(123);
            let result3 = emitter.filterSensitiveData(null);
            this.assert('string' === result1, 'Should return string unchanged');
            this.assert(123 === result2, 'Should return number unchanged');
            this.assert(null === result3, 'Should return null unchanged');
        });
    }

    testFilterSensitiveDataWithSensitiveFields()
    {
        this.test('filterSensitiveData filters sensitive fields', () => {
            let emitter = new EventsManager();
            let obj = {
                username: 'test',
                password: 'secret123',
                authToken: 'token123',
                secretKey: 'key123',
                safe: 'data'
            };
            let result = emitter.filterSensitiveData(obj);
            this.assert('test' === result.username, 'Should keep safe fields');
            this.assert('[FILTERED]' === result.password, 'Should filter password');
            this.assert('[FILTERED]' === result.authToken, 'Should filter token');
            this.assert('[FILTERED]' === result.secretKey, 'Should filter key');
            this.assert('data' === result.safe, 'Should keep safe data');
        });
    }

    testFilterSensitiveDataWithDangerousKeys()
    {
        this.test('filterSensitiveData removes dangerous keys', () => {
            let emitter = new EventsManager();
            let obj = {
                safe: 'data',
                __proto__: 'dangerous',
                constructor: 'dangerous',
                prototype: 'dangerous'
            };
            let result = emitter.filterSensitiveData(obj);
            this.assert('data' === result.safe, 'Should keep safe data');
            this.assert(!result.hasOwnProperty('__proto__'), 'Should remove __proto__');
            this.assert(!result.hasOwnProperty('constructor'), 'Should remove constructor');
            this.assert(!result.hasOwnProperty('prototype'), 'Should remove prototype');
        });
    }

    testFilterSensitiveDataWithNestedObjects()
    {
        this.test('filterSensitiveData handles nested objects', () => {
            let emitter = new EventsManager();
            let obj = {
                user: {
                    name: 'test',
                    password: 'secret'
                },
                config: {
                    secretKey: 'key123',
                    safe: 'value'
                }
            };
            let result = emitter.filterSensitiveData(obj);
            this.assert('test' === result.user.name, 'Should keep nested safe fields');
            this.assert('[FILTERED]' === result.user.password, 'Should filter nested password');
            this.assert('[FILTERED]' === result.config.secretKey, 'Should filter nested key');
            this.assert('value' === result.config.safe, 'Should keep nested safe value');
        });
    }

    testValidateEventKeyWithLongKey()
    {
        this.test('validateEventKey rejects long keys', () => {
            let emitter = new EventsManager();
            emitter.maxEventKeyLength = 10;
            let longKey = 'a'.repeat(20);
            let result = emitter.validateEventKey(longKey);
            this.assert(false === result, 'Should reject keys exceeding maxEventKeyLength');
        });
    }

    testValidateEventKeyCachesResults()
    {
        this.test('validateEventKey caches validation results', () => {
            let emitter = new EventsManager();
            let key = 'cache-test-key';
            emitter.validateEventKey(key);
            this.assert(emitter._validationCache.has(key), 'Should cache validation result');
            let cachedResult = emitter._validationCache.get(key);
            let secondResult = emitter.validateEventKey(key);
            this.assert(cachedResult === secondResult, 'Should return cached result on second call');
        });
    }

    testLogDebugEventWithNullDebugPatterns()
    {
        this.test('logDebugEvent handles null _debugPatterns', () => {
            let emitter = new EventsManager();
            emitter.debug = 'test,custom';
            emitter._debugPatterns = null;

            try{
                emitter.logDebugEvent('test', 'Listen');
                this.assert(emitter._debugPatterns instanceof Set, 'Should create debug patterns Set');
            } catch(error){
                this.assert(false, 'Should not throw error when _debugPatterns is null');
            }
        });
    }

    testLogDebugEventWithFilteredArgs()
    {
        this.test('logDebugEvent filters sensitive data in args', () => {
            let emitter = new EventsManager();
            emitter.debug = 'all';
            let loggedMessages = [];
            let originalLog = console.log;

            try{
                console.log = (...args) => loggedMessages.push(args.join(' '));
                process.env.RELDENS_LOG_LEVEL = 8;
                let sensitiveArgs = [{password: 'secret', safe: 'data'}];
                emitter.logDebugEvent('test', 'Fire', sensitiveArgs);
            } finally{
                console.log = originalLog;
                delete process.env.RELDENS_LOG_LEVEL;
            }

            let debugLog = loggedMessages.find(log => log.includes('Fire Event: test'));
            this.assert(debugLog, 'Should log debug event');
            this.assert(debugLog.includes('with 1 arguments'), 'Should mention filtered arguments');
        });
    }

    testEmitWithSanitizedArgs()
    {
        this.test('emit uses sanitized arguments', async () => {
            let emitter = new EventsManager();
            emitter.enableSensitiveDataFiltering = true;
            let receivedArgs = null;

            emitter.on('sanitize-test', (...args) => {
                receivedArgs = args;
            });

            let sensitiveData = {password: 'secret', safe: 'data'};
            await emitter.emit('sanitize-test', sensitiveData);

            this.assert(receivedArgs && 1 === receivedArgs.length, 'Should receive arguments');
            this.assert('[FILTERED]' === receivedArgs[0].password, 'Should filter sensitive data');
            this.assert('data' === receivedArgs[0].safe, 'Should keep safe data');
        });
    }

    testEmitSyncWithSanitizedArgs()
    {
        this.test('emitSync uses sanitized arguments', () => {
            let emitter = new EventsManager();
            emitter.enableSensitiveDataFiltering = true;
            let receivedArgs = null;

            emitter.on('sanitize-sync-test', (...args) => {
                receivedArgs = args;
            });

            let sensitiveData = {authToken: 'token123', safe: 'data'};
            emitter.emitSync('sanitize-sync-test', sensitiveData);

            this.assert(receivedArgs && 1 === receivedArgs.length, 'Should receive arguments');
            this.assert('[FILTERED]' === receivedArgs[0].authToken, 'Should filter sensitive data');
            this.assert('data' === receivedArgs[0].safe, 'Should keep safe data');
        });
    }

    testCheckMemoryLeaksCalledOnAllListenerMethods()
    {
        this.test('checkMemoryLeaks called on all listener methods', () => {
            let emitter = new EventsManager();
            let checkCount = 0;
            let originalCheck = emitter.checkMemoryLeaks;
            emitter.checkMemoryLeaks = () => {
                checkCount++;
                return originalCheck.call(emitter);
            };

            emitter.on('check-test', () => {});
            emitter.prepend('check-test', () => {});
            emitter.once('check-test', () => {});
            emitter.prependOnce('check-test', () => {});

            this.assert(4 === checkCount, 'Should call checkMemoryLeaks on all listener methods');
        });
    }

    testDebugPatternsEarlyReturn()
    {
        this.test('logDebugEvent early return when no pattern match', () => {
            let emitter = new EventsManager();
            emitter.debug = 'specific-pattern';
            emitter._debugPatterns = new Set(['specific-pattern']);

            let loggedMessages = [];
            let originalLog = console.log;
            try{
                console.log = (...args) => loggedMessages.push(args.join(' '));
                process.env.RELDENS_LOG_LEVEL = 8;
                emitter.logDebugEvent('non-matching-key', 'Listen');
            } finally{
                console.log = originalLog;
                delete process.env.RELDENS_LOG_LEVEL;
            }

            let debugLogs = loggedMessages.filter(log => log.includes('Listen Event:'));
            this.assert(0 === debugLogs.length, 'Should not log when no pattern matches');
        });
    }

    testBasicOnEmitFunctionality()
    {
        this.test('Basic on/emit functionality', async () => {
            let emitter = new EventsManager();
            let called = false;
            let eventData = null;

            emitter.on('test-event', (data) => {
                called = true;
                eventData = data;
            });

            await emitter.emit('test-event', 'test-data');
            this.assert(called, 'Event listener should be called');
            this.assert('test-data' === eventData, 'Event data should be passed correctly');
        });
    }

    testMultipleListenersForSameEvent()
    {
        this.test('Multiple listeners for same event', async () => {
            let emitter = new EventsManager();
            let callCount = 0;

            emitter.on('multi-test', () => callCount++);
            emitter.on('multi-test', () => callCount++);
            emitter.on('multi-test', () => callCount++);

            await emitter.emit('multi-test');
            this.assert(3 === callCount, 'All listeners should be called');
        });
    }

    testOnceListenerRemovesAfterFirstCall()
    {
        this.test('Once listener removes after first call', async () => {
            let emitter = new EventsManager();
            let callCount = 0;

            emitter.once('once-test', () => callCount++);

            await emitter.emit('once-test');
            await emitter.emit('once-test');
            this.assert(1 === callCount, 'Once listener should only be called once');
        });
    }

    testPrependListenerAddsToBeginning()
    {
        this.test('Prepend listener adds to beginning', async () => {
            let emitter = new EventsManager();
            let order = [];

            emitter.on('order-test', () => order.push('second'));
            emitter.prepend('order-test', () => order.push('first'));

            await emitter.emit('order-test');
            this.assert('first' === order[0], 'Prepended listener should be first');
            this.assert('second' === order[1], 'Original listener should be second');
        });
    }

    testPrependOnceListener()
    {
        this.test('PrependOnce listener', async () => {
            let emitter = new EventsManager();
            let order = [];

            emitter.on('prepend-once-test', () => order.push('second'));
            emitter.prependOnce('prepend-once-test', () => order.push('first'));

            await emitter.emit('prepend-once-test');
            await emitter.emit('prepend-once-test');
            this.assert(3 === order.length, 'Should have 3 calls total');
            this.assert('first' === order[0], 'Prepended once should be first');
            this.assert('second' === order[1], 'Regular listener second');
            this.assert('second' === order[2], 'Regular listener third');
        });
    }

    testListenersMethodReturnsArrayOfFunctions()
    {
        this.test('Listeners method returns array of functions', () => {
            let emitter = new EventsManager();
            let fn1 = () => {};
            let fn2 = () => {};

            emitter.on('listeners-test', fn1);
            emitter.on('listeners-test', fn2);

            let listeners = emitter.listeners('listeners-test');
            this.assert(Array.isArray(listeners), 'Should return array');
            this.assert(2 === listeners.length, 'Should return 2 listeners');
            this.assert(fn1 === listeners[0], 'Should return first function');
            this.assert(fn2 === listeners[1], 'Should return second function');
        });
    }

    testRemoveListenerRemovesSpecificFunction()
    {
        this.test('RemoveListener removes specific function', async () => {
            let emitter = new EventsManager();
            let called1 = false;
            let called2 = false;
            let fn1 = () => called1 = true;
            let fn2 = () => called2 = true;

            emitter.on('remove-test', fn1);
            emitter.on('remove-test', fn2);
            emitter.removeListener('remove-test', fn1);

            await emitter.emit('remove-test');
            this.assert(!called1, 'Removed listener should not be called');
            this.assert(called2, 'Remaining listener should be called');
        });
    }

    testRemoveListenerRemovesAllIfNoFunctionSpecified()
    {
        this.test('RemoveListener removes all if no function specified', async () => {
            let emitter = new EventsManager();
            let called = false;

            emitter.on('remove-all-test', () => called = true);
            emitter.removeListener('remove-all-test');

            await emitter.emit('remove-all-test');
            this.assert(!called, 'All listeners should be removed');
        });
    }

    testRemoveAllListenersClearsAllEvents()
    {
        this.test('RemoveAllListeners clears all events', async () => {
            let emitter = new EventsManager();
            let called1 = false;
            let called2 = false;

            emitter.on('clear-test1', () => called1 = true);
            emitter.on('clear-test2', () => called2 = true);
            emitter.removeAllListeners();

            await emitter.emit('clear-test1');
            await emitter.emit('clear-test2');
            this.assert(!called1, 'First event should not fire');
            this.assert(!called2, 'Second event should not fire');
        });
    }

    testOffAliasWorksLikeRemoveListener()
    {
        this.test('Off alias works like removeListener', async () => {
            let emitter = new EventsManager();
            let called = false;
            let fn = () => called = true;

            emitter.on('off-test', fn);
            emitter.off('off-test', fn);

            await emitter.emit('off-test');
            this.assert(!called, 'Off should remove listener');
        });
    }

    testAddListenerAliasWorksLikeOn()
    {
        this.test('AddListener alias works like on', async () => {
            let emitter = new EventsManager();
            let called = false;

            emitter.addListener('add-test', () => called = true);

            await emitter.emit('add-test');
            this.assert(called, 'AddListener should work like on');
        });
    }

    testPrependListenerAliasWorksLikePrepend()
    {
        this.test('PrependListener alias works like prepend', async () => {
            let emitter = new EventsManager();
            let order = [];

            emitter.on('prepend-alias-test', () => order.push('second'));
            emitter.prependListener('prepend-alias-test', () => order.push('first'));

            await emitter.emit('prepend-alias-test');
            this.assert('first' === order[0], 'PrependListener should work like prepend');
        });
    }

    testPrependOnceListenerAliasWorksLikePrependOnce()
    {
        this.test('PrependOnceListener alias works like prependOnce', async () => {
            let emitter = new EventsManager();
            let callCount = 0;

            emitter.prependOnceListener('prepend-once-alias', () => callCount++);

            await emitter.emit('prepend-once-alias');
            await emitter.emit('prepend-once-alias');
            this.assert(1 === callCount, 'PrependOnceListener should work like prependOnce');
        });
    }

    testOnWithKeyBasicFunctionality()
    {
        this.test('onWithKey basic functionality', async () => {
            let emitter = new EventsManager();
            let called = false;

            emitter.onWithKey('key-test', () => called = true, 'test-key');

            await emitter.emit('key-test');
            this.assert(called, 'onWithKey should work like on');
            this.assert(emitter.eventsByRemoveKeys['test-key'], 'Should store event by key');
        });
    }

    testOffWithKeyRemovesByKey()
    {
        this.test('offWithKey removes by key', async () => {
            let emitter = new EventsManager();
            let called = false;

            emitter.onWithKey('key-remove-test', () => called = true, 'remove-key');
            emitter.offWithKey('remove-key');

            await emitter.emit('key-remove-test');
            this.assert(!called, 'offWithKey should remove listener');
            this.assert(!emitter.eventsByRemoveKeys['remove-key'], 'Should remove key from storage');
        });
    }

    testOnWithKeyWithMasterKey()
    {
        this.test('onWithKey with master key', async () => {
            let emitter = new EventsManager();
            let called = false;

            emitter.onWithKey('master-test', () => called = true, 'sub-key', 'master-key');

            await emitter.emit('master-test');
            this.assert(called, 'onWithKey with master key should work');
            this.assert(emitter.eventsByRemoveKeys['master-key'], 'Should store master key');
            this.assert(emitter.eventsByRemoveKeys['master-key']['sub-key'], 'Should store sub key under master');
        });
    }

    testOffWithKeyWithMasterKey()
    {
        this.test('offWithKey with master key', async () => {
            let emitter = new EventsManager();
            let called = false;

            emitter.onWithKey('master-remove-test', () => called = true, 'sub-key', 'master-key');
            emitter.offWithKey('sub-key', 'master-key');

            await emitter.emit('master-remove-test');
            this.assert(!called, 'offWithKey with master key should remove listener');
        });
    }

    testOffByMasterKeyRemovesAllEventsUnderMasterKey()
    {
        this.test('offByMasterKey removes all events under master key', async () => {
            let emitter = new EventsManager();
            let called1 = false;
            let called2 = false;

            emitter.onWithKey('master-bulk1', () => called1 = true, 'sub1', 'bulk-master');
            emitter.onWithKey('master-bulk2', () => called2 = true, 'sub2', 'bulk-master');
            emitter.offByMasterKey('bulk-master');

            await emitter.emit('master-bulk1');
            await emitter.emit('master-bulk2');
            this.assert(!called1, 'First event should be removed');
            this.assert(!called2, 'Second event should be removed');
            this.assert(!emitter.eventsByRemoveKeys['bulk-master'], 'Master key should be removed');
        });
    }

    testOffByMasterKeyRemovesEveryListenerOfTheSameEventAndKeepsTheOthers()
    {
        this.test('offByMasterKey removes every listener of the same event and keeps the others', async () => {
            let emitter = new EventsManager();
            let calls = [];
            emitter.onWithKey('master-same-event', () => calls.push('first'), 'same-sub1', 'same-master');
            emitter.onWithKey('master-same-event', () => calls.push('second'), 'same-sub2', 'same-master');
            emitter.on('master-same-event', () => calls.push('other'));
            emitter.offByMasterKey('same-master');
            await emitter.emit('master-same-event');
            this.assert(1 === calls.length, 'Only the listener without the master key should be called');
            this.assert('other' === calls[0], 'The listener without the master key should be kept');
        });
    }

    testOffByMasterKeyClearsTheCacheOfAListenerAlreadyRemoved()
    {
        this.test('offByMasterKey clears the cache of a listener already removed with off', () => {
            let emitter = new EventsManager();
            let removedListener = () => {
                return 'removed';
            };
            emitter.onWithKey('master-removed-event', removedListener, 'removed-sub', 'removed-master');
            emitter.off('master-removed-event', removedListener);
            emitter.offByMasterKey('removed-master');
            this.assert(!emitter._listenersCache['master-removed-event'], 'The event cache entry should be deleted');
            this.assert(!emitter.eventsByRemoveKeys['removed-master'], 'The master key should be removed');
        });
    }

    testOffByMasterKeyDeletesTheEmptiedEvents()
    {
        this.test('offByMasterKey deletes the events left without listeners', () => {
            let emitter = new EventsManager();
            emitter.onWithKey('master-emptied-event', () => {
                return 'first';
            }, 'emptied-sub1', 'emptied-master');
            emitter.onWithKey('master-emptied-event', () => {
                return 'second';
            }, 'emptied-sub2', 'emptied-master');
            emitter.offByMasterKey('emptied-master');
            this.assert(!emitter._events['master-emptied-event'], 'The emptied event should be deleted');
            this.assert(0 === emitter.listeners('master-emptied-event').length, 'The event should have no listeners');
        });
    }

    testOffByMasterKeyWithInvalidMasterKeyReturnsFalse()
    {
        this.test('offByMasterKey with an invalid master key returns false', () => {
            let emitter = new EventsManager();
            this.assert(false === emitter.offByMasterKey('__proto__'), 'Should return false for an invalid master key');
        });
    }

    testOnWithKeyReturnsTheRegisteredListener()
    {
        this.test('onWithKey returns the registered listener', () => {
            let emitter = new EventsManager();
            let keyedListener = () => {
                return 'keyed';
            };
            let result = emitter.onWithKey('keyed-return-event', keyedListener, 'keyed-return-key');
            this.assert(keyedListener === result, 'Should return the registered listener');
        });
    }

    testOnWithKeyRejectsInvalidRemoveKey()
    {
        this.test('onWithKey rejects an invalid remove key and adds no listener', () => {
            let emitter = new EventsManager();
            let result = emitter.onWithKey('invalid-remove-key-event', () => {
                return 'invalid';
            }, '__proto__');
            this.assert(false === result, 'Should reject the invalid remove key');
            this.assert(0 === emitter.listeners('invalid-remove-key-event').length, 'Should add no listener');
        });
    }

    testOnWithKeyRejectsInvalidMasterKey()
    {
        this.test('onWithKey rejects an invalid master key and adds no listener', () => {
            let emitter = new EventsManager();
            let result = emitter.onWithKey('invalid-master-key-event', () => {
                return 'invalid';
            }, 'invalid-master-sub', '__proto__');
            this.assert(false === result, 'Should reject the invalid master key');
            this.assert(0 === emitter.listeners('invalid-master-key-event').length, 'Should add no listener');
        });
    }

    testOnWithKeyRejectsDuplicateKeyUnderTheSameMasterKey()
    {
        this.test('onWithKey rejects a duplicated key under the same master key', () => {
            let emitter = new EventsManager();
            emitter.onWithKey('duplicated-master-event', () => {
                return 'first';
            }, 'duplicated-sub', 'duplicated-master');
            let result = emitter.onWithKey('duplicated-master-event', () => {
                return 'second';
            }, 'duplicated-sub', 'duplicated-master');
            this.assert(false === result, 'Should reject the duplicated key');
            this.assert(1 === emitter.listeners('duplicated-master-event').length, 'Should keep a single listener');
        });
    }

    testOffWithKeyKeepsTheOtherListenersOfTheSameEvent()
    {
        this.test('offWithKey keeps the other listeners of the same event', async () => {
            let emitter = new EventsManager();
            let calls = [];
            emitter.onWithKey('keyed-shared-event', () => calls.push('keyed'), 'keyed-shared-key');
            emitter.on('keyed-shared-event', () => calls.push('other'));
            emitter.offWithKey('keyed-shared-key');
            await emitter.emit('keyed-shared-event');
            this.assert(1 === calls.length, 'Only the listener without the key should be called');
            this.assert('other' === calls[0], 'The listener without the key should be kept');
        });
    }

    testOffWithKeyDeletesTheEmptiedEvent()
    {
        this.test('offWithKey deletes the event left without listeners', () => {
            let emitter = new EventsManager();
            emitter.onWithKey('keyed-emptied-event', () => {
                return 'keyed';
            }, 'keyed-emptied-key');
            emitter.offWithKey('keyed-emptied-key');
            this.assert(!emitter._events['keyed-emptied-event'], 'The emptied event should be deleted');
        });
    }

    testOffWithKeyWithInvalidKeysReturnsFalse()
    {
        this.test('offWithKey with an invalid remove key or master key returns false', () => {
            let emitter = new EventsManager();
            this.assert(false === emitter.offWithKey('__proto__'), 'Should return false for an invalid remove key');
            this.assert(
                false === emitter.offWithKey('valid-remove-key', '__proto__'),
                'Should return false for an invalid master key'
            );
        });
    }

    testOffWithKeyWithAMissingMasterKeyReturnsFalse()
    {
        this.test('offWithKey with a missing master key returns false', () => {
            let emitter = new EventsManager();
            this.assert(
                false === emitter.offWithKey('missing-master-sub', 'missing-master'),
                'Should return false for a missing master key'
            );
        });
    }

    testOffWithKeyWithAMissingKeyOfAnExistingMasterKeyReturnsFalse()
    {
        this.test('offWithKey with a missing key of an existing master key returns false and keeps it', async () => {
            let emitter = new EventsManager();
            let called = false;
            emitter.onWithKey('existing-master-event', () => called = true, 'existing-sub', 'existing-master');
            let result = emitter.offWithKey('missing-sub', 'existing-master');
            await emitter.emit('existing-master-event');
            this.assert(false === result, 'Should return false for a missing key');
            this.assert(called, 'The existing keyed listener should be kept');
        });
    }

    testOffWithKeyOfTheLastKeyOfAMasterKeyDeletesTheMasterKey()
    {
        this.test('offWithKey of the last key of a master key deletes the master key', () => {
            let emitter = new EventsManager();
            emitter.onWithKey('last-master-event1', () => {
                return 'first';
            }, 'last-sub1', 'last-master');
            emitter.onWithKey('last-master-event2', () => {
                return 'second';
            }, 'last-sub2', 'last-master');
            emitter.offWithKey('last-sub1', 'last-master');
            this.assert(emitter.eventsByRemoveKeys['last-master'], 'The master key should be kept with a key left');
            emitter.offWithKey('last-sub2', 'last-master');
            this.assert(!emitter.eventsByRemoveKeys['last-master'], 'The master key without keys should be deleted');
        });
    }

    testOffWithKeyOfAListenerAlreadyRemovedClearsTheKeyAndTheCache()
    {
        this.test('offWithKey of a listener already removed with off clears its key and the cache', () => {
            let emitter = new EventsManager();
            let removedListener = () => {
                return 'removed';
            };
            emitter.onWithKey('keyed-removed-event', removedListener, 'keyed-removed-key');
            emitter.off('keyed-removed-event', removedListener);
            let result = emitter.offWithKey('keyed-removed-key');
            this.assert(false === result, 'Should return false when the listener is not found');
            this.assert(!emitter.eventsByRemoveKeys['keyed-removed-key'], 'The stale key should be removed');
            this.assert(!emitter._listenersCache['keyed-removed-event'], 'The event cache entry should be deleted');
        });
    }

    testEmitSyncWorksWithoutAwait()
    {
        this.test('EmitSync works without await', () => {
            let emitter = new EventsManager();
            let called = false;

            emitter.on('sync-test', () => called = true);
            emitter.emitSync('sync-test');

            this.assert(called, 'EmitSync should call listeners immediately');
        });
    }

    testDebugFunctionalityLogsEvents()
    {
        this.test('Debug functionality logs events', async () => {
            let emitter = new EventsManager();
            let loggedEvents = [];
            let originalLog = console.log;
            try{
                console.log = (...args) => loggedEvents.push(args.join(' '));
                process.env.RELDENS_LOG_LEVEL = 8;
                emitter.debug = 'all';
                emitter.on('debug-test', () => {});
                await emitter.emit('debug-test');
            } finally{
                console.log = originalLog;
                delete process.env.RELDENS_LOG_LEVEL;
            }
            let hasListenLog = loggedEvents.some(log => log.includes('Listen Event:'));
            let hasFireLog = loggedEvents.some(log => log.includes('Fire Event:'));
            this.assert(hasListenLog, 'Should log listen events');
            this.assert(hasFireLog, 'Should log fire events');
        });
    }

    testAsyncListenersWithPromises()
    {
        this.test('Async listeners with promises', async () => {
            let emitter = new EventsManager();
            let asyncResult = '';

            emitter.on('async-test', async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                asyncResult = 'async-complete';
            });

            await emitter.emit('async-test');
            this.assert('async-complete' === asyncResult, 'Should await async listeners');
        });
    }

    testInvalidEventKeyThrowsError()
    {
        this.test('Invalid event key throws error', () => {
            let emitter = new EventsManager();
            let errorThrown = false;

            try{
                emitter.on(123, () => {});
            } catch(error){
                errorThrown = true;
                this.assert(error instanceof TypeError, 'Should throw TypeError for invalid type');
            }
            this.assert(errorThrown, 'Should throw error for invalid event key');
        });
    }

    testInvalidFunctionThrowsError()
    {
        this.test('Invalid function throws error', () => {
            let emitter = new EventsManager();
            let errorThrown = false;

            try{
                emitter.on('test', 'not-a-function');
            } catch(error){
                errorThrown = true;
                this.assert(error instanceof TypeError, 'Should throw TypeError for invalid function');
            }
            this.assert(errorThrown, 'Should throw error for invalid function');
        });
    }

    testDangerousKeysRejectedByOnWithKey()
    {
        this.test('Dangerous keys rejected by onWithKey', () => {
            let emitter = new EventsManager();
            let result = emitter.onWithKey('__proto__', () => {}, 'test-key');
            this.assert(false === result, 'Should reject dangerous keys');
        });
    }

    testMissingParametersHandledGracefully()
    {
        this.test('Missing parameters handled gracefully', () => {
            let emitter = new EventsManager();
            let errorThrown = false;

            try{
                emitter.on();
            } catch(error){
                errorThrown = true;
            }
            this.assert(errorThrown, 'Should throw error for missing parameters');
        });
    }

    testOffWithKeyWithNonExistentKeyReturnsFalse()
    {
        this.test('offWithKey with non-existent key returns false', () => {
            let emitter = new EventsManager();
            let result = emitter.offWithKey('non-existent-key');
            this.assert(false === result, 'Should return false for non-existent key');
        });
    }

    testOffByMasterKeyWithNonExistentMasterKeyReturnsFalse()
    {
        this.test('offByMasterKey with non-existent master key returns false', () => {
            let emitter = new EventsManager();
            let result = emitter.offByMasterKey('non-existent-master');
            this.assert(false === result, 'Should return false for non-existent master key');
        });
    }

    testDuplicateKeyRegistrationReturnsFalse()
    {
        this.test('Duplicate key registration returns false', () => {
            let emitter = new EventsManager();
            emitter.onWithKey('dup-test', () => {}, 'dup-key');
            let result = emitter.onWithKey('dup-test2', () => {}, 'dup-key');
            this.assert(false === result, 'Should return false for duplicate key');
        });
    }

    testEmptyEventNameHandled()
    {
        this.test('Empty event name handled', () => {
            let emitter = new EventsManager();
            let called = false;

            emitter.on('', () => called = true);
            emitter.emit('');

            this.assert(called, 'Should handle empty string event names');
        });
    }

    testSymbolEventKeysWork()
    {
        this.test('Symbol event keys work', () => {
            let emitter = new EventsManager();
            let called = false;
            let sym = Symbol('test-symbol');

            emitter.on(sym, () => called = true);
            emitter.emit(sym);

            this.assert(called, 'Should handle symbol event keys');
        });
    }

    testEmitWithNoListenersReturnsFalse()
    {
        this.test('Emit with no listeners returns false', async () => {
            let emitter = new EventsManager();
            let result = await emitter.emit('no-listeners');
            this.assert(false === result, 'Should return false when no listeners');
        });
    }

    testEmitWithListenersReturnsTrue()
    {
        this.test('Emit with listeners returns true', async () => {
            let emitter = new EventsManager();
            emitter.on('has-listeners', () => {});
            let result = await emitter.emit('has-listeners');
            this.assert(true === result, 'Should return true when has listeners');
        });
    }

    testFilterSensitiveDataWithCircularReferences()
    {
        this.test('filterSensitiveData handles circular references', () => {
            let emitter = new EventsManager();
            let obj = {safe: 'data'};
            obj.circular = obj;
            let result = emitter.filterSensitiveData(obj);
            this.assert('[CIRCULAR]' === result.circular, 'Should handle circular refs');
        });
    }

    createListener(calls, listenerName)
    {
        return () => {
            calls.push(listenerName);
        };
    }

    captureLogs(callback)
    {
        let loggedMessages = [];
        let originalLog = console.log;
        console.log = (...args) => loggedMessages.push(args.join(' '));
        process.env.RELDENS_LOG_LEVEL = 8;
        let callbackError = false;
        try {
            callback();
        } catch(error) {
            callbackError = error;
        }
        console.log = originalLog;
        delete process.env.RELDENS_LOG_LEVEL;
        return {loggedMessages, callbackError};
    }

    assertThrowsTypeError(callback, message)
    {
        let thrownError = false;
        try {
            callback();
        } catch(error) {
            thrownError = error;
        }
        this.assert(thrownError instanceof TypeError, message);
    }

    testAssertTypeRejectsEveryNonStringAndNonSymbolType()
    {
        this.test('assertType throws a TypeError for missing types, null, objects, functions and booleans', () => {
            let emitter = new EventsManager();
            for(let invalidType of [null, {}, [], true, this.createListener([], 'type')]){
                this.assertThrowsTypeError(
                    () => emitter.assertType(invalidType),
                    'Should throw a TypeError for '+String(invalidType)
                );
            }
            this.assertThrowsTypeError(() => emitter.assertType(), 'Should throw a TypeError for a missing type');
        });
    }

    testAssertFnRejectsEveryNonFunction()
    {
        this.test('assertFn throws a TypeError for every non function and accepts functions', () => {
            let emitter = new EventsManager();
            for(let invalidFunction of [null, 'text', 1, {}, []]){
                this.assertThrowsTypeError(
                    () => emitter.assertFn(invalidFunction),
                    'Should throw a TypeError for '+String(invalidFunction)
                );
            }
            this.assertThrowsTypeError(() => emitter.assertFn(), 'Should throw a TypeError for a missing function');
            emitter.assertFn(this.createListener([], 'valid'));
        });
    }

    testValidateEventKeyRejectsDangerousKeys()
    {
        this.test('validateEventKey rejects the __proto__, constructor and prototype keys', () => {
            let emitter = new EventsManager();
            for(let dangerousKey of ['__proto__', 'constructor', 'prototype']){
                this.assert(false === emitter.validateEventKey(dangerousKey), 'Should reject '+dangerousKey);
            }
        });
    }

    testValidateEventKeyAcceptsAKeyOfTheMaximumLength()
    {
        this.test('validateEventKey accepts a key of exactly the maximum length', () => {
            let emitter = new EventsManager();
            emitter.maxEventKeyLength = 10;
            this.assert(true === emitter.validateEventKey('a'.repeat(10)), 'Should accept the maximum length');
            this.assert(false === emitter.validateEventKey('a'.repeat(11)), 'Should reject one more character');
        });
    }

    testValidateEventKeyAcceptsSymbols()
    {
        this.test('validateEventKey accepts symbols', () => {
            let emitter = new EventsManager();
            this.assert(true === emitter.validateEventKey(Symbol('symbol-key')), 'Should accept a symbol');
        });
    }

    testValidateEventKeyReturnsTheCachedRejection()
    {
        this.test('validateEventKey returns the cached rejection of a key', () => {
            let emitter = new EventsManager();
            emitter.maxEventKeyLength = 10;
            let longKey = 'a'.repeat(20);
            emitter.validateEventKey(longKey);
            emitter.maxEventKeyLength = 100;
            this.assert(false === emitter.validateEventKey(longKey), 'Should return the cached rejection');
        });
    }

    testValidationCacheIsClearedWhenFull()
    {
        this.test('validateEventKey clears the validation cache when it is full', () => {
            let emitter = new EventsManager();
            emitter.maxValidationCacheSize = 2;
            emitter.validateEventKey('first-cached-key');
            emitter.validateEventKey('second-cached-key');
            emitter.validateEventKey('third-cached-key');
            this.assert(2 >= emitter._validationCache.size, 'The cache should never exceed its maximum size');
            this.assert(emitter._validationCache.has('third-cached-key'), 'The last key should be cached');
        });
    }

    testIsValidRemoveKeyRejectsNonStringsEmptyAndDangerousKeys()
    {
        this.test('isValidRemoveKey accepts only non empty safe strings', () => {
            let emitter = new EventsManager();
            for(let invalidKey of [null, '', 123, {}, Symbol('remove-key'), '__proto__']){
                this.assert(false === emitter.isValidRemoveKey(invalidKey), 'Should reject '+String(invalidKey));
            }
            this.assert(false === emitter.isValidRemoveKey(), 'Should reject a missing key');
            this.assert(true === emitter.isValidRemoveKey('valid-remove-key'), 'Should accept a string key');
        });
    }

    testSanitizeEventArgsAcceptsTheMaximumArgs()
    {
        this.test('sanitizeEventArgs keeps exactly the maximum number of arguments', () => {
            let emitter = new EventsManager();
            emitter.maxEventArgs = 3;
            this.assert(3 === emitter.sanitizeEventArgs([1, 2, 3]).length, 'Should keep the maximum arguments');
        });
    }

    testSanitizeEventArgsWithoutFilteringReturnsTheSameArgs()
    {
        this.test('sanitizeEventArgs without the filtering returns the same arguments unfiltered', () => {
            let emitter = new EventsManager();
            let args = [{password: 'secret'}];
            let result = emitter.sanitizeEventArgs(args);
            this.assert(args === result, 'Should return the same arguments array');
            this.assert('secret' === result[0].password, 'Should not filter when the filtering is disabled');
        });
    }

    testSanitizeEventArgsWithFilteringKeepsThePrimitives()
    {
        this.test('sanitizeEventArgs with the filtering keeps the primitives and filters the objects', () => {
            let emitter = new EventsManager();
            emitter.enableSensitiveDataFiltering = true;
            let result = emitter.sanitizeEventArgs(['text', 5, {password: 'secret'}]);
            this.assert('text' === result[0], 'Should keep the string');
            this.assert(5 === result[1], 'Should keep the number');
            this.assert('[FILTERED]' === result[2].password, 'Should filter the object');
        });
    }

    testFilterSensitiveDataReturnsMapsSetsDatesAndArraysUnchanged()
    {
        this.test('filterSensitiveData returns maps, sets, dates and arrays unchanged', () => {
            let emitter = new EventsManager();
            for(let specialObject of [new Map(), new Set(), new Date(), [{password: 'secret'}]]){
                this.assert(specialObject === emitter.filterSensitiveData(specialObject), 'Should return it unchanged');
            }
        });
    }

    testFilterSensitiveDataReturnsClassInstancesUnchanged()
    {
        this.test('filterSensitiveData returns the class instances unchanged', () => {
            let emitter = new EventsManager();
            this.assert(emitter === emitter.filterSensitiveData(emitter), 'Should return the instance unchanged');
        });
    }

    testFilterSensitiveDataSkipsOwnProtoKeys()
    {
        this.test('filterSensitiveData skips the own __proto__ key and pollutes nothing', () => {
            let emitter = new EventsManager();
            let receivedData = {safe: 1};
            Object.defineProperty(receivedData, '__proto__', {value: {polluted: true}, enumerable: true});
            let result = emitter.filterSensitiveData(receivedData);
            this.assert(1 === result.safe, 'Should keep the safe key');
            this.assert(!Object.keys(result).includes('__proto__'), 'Should skip the own __proto__ key');
            this.assert(!({}).polluted, 'Should not pollute the object prototype');
        });
    }

    testFilterSensitiveDataMatchesTheSensitiveKeysIgnoringCase()
    {
        this.test('filterSensitiveData matches the sensitive keys ignoring the case', () => {
            let emitter = new EventsManager();
            let result = emitter.filterSensitiveData({PASSWORD: 'secret', UserCredential: 'value', name: 'player'});
            this.assert('[FILTERED]' === result.PASSWORD, 'Should filter the upper case key');
            this.assert('[FILTERED]' === result.UserCredential, 'Should filter the mixed case key');
            this.assert('player' === result.name, 'Should keep the safe key');
        });
    }

    testFilterSensitiveDataKeepsTheFunctions()
    {
        this.test('filterSensitiveData keeps the function values', () => {
            let emitter = new EventsManager();
            let callback = this.createListener([], 'callback');
            this.assert(callback === emitter.filterSensitiveData({callback}).callback, 'Should keep the function');
        });
    }

    testFilterSensitiveDataFiltersASharedObjectReferencedTwice()
    {
        this.test('filterSensitiveData filters a shared object referenced twice without marking it circular', () => {
            let emitter = new EventsManager();
            let sharedData = {token: 'secret', name: 'shared'};
            let result = emitter.filterSensitiveData({first: sharedData, second: sharedData});
            this.assert('[FILTERED]' === result.first.token, 'Should filter the first reference');
            this.assert('[FILTERED]' === result.second.token, 'Should filter the second reference');
            this.assert('shared' === result.second.name, 'Should not mark the second reference as circular');
        });
    }

    testCheckMemoryLeaksDoesNotFlagTheMaximumListeners()
    {
        this.test('checkMemoryLeaks flags only the listeners over the maximum', () => {
            let emitter = new EventsManager();
            emitter.maxListeners = 3;
            let calls = [];
            emitter.on('max-listeners-event', this.createListener(calls, 'first'));
            emitter.on('max-listeners-event', this.createListener(calls, 'second'));
            emitter.on('max-listeners-event', this.createListener(calls, 'third'));
            this.assert(false === emitter.hasLoggedMaxListeners, 'Should not flag the maximum listeners');
            emitter.on('max-listeners-event', this.createListener(calls, 'fourth'));
            this.assert(true === emitter.hasLoggedMaxListeners, 'Should flag the listeners over the maximum');
        });
    }

    testListenerMethodsReturnTheEmitter()
    {
        this.test('on, addListener, prepend, prependListener, once, prependOnce return the emitter', () => {
            let emitter = new EventsManager();
            let calls = [];
            let methodNames = ['on', 'addListener', 'prepend', 'prependListener', 'once', 'prependOnce', 'prependOnceListener'];
            for(let methodName of methodNames){
                this.assert(
                    emitter === emitter[methodName]('chain-event', this.createListener(calls, methodName)),
                    methodName+' should return the emitter'
                );
            }
        });
    }

    testListenerMethodsRejectDangerousEventKeys()
    {
        this.test('on, prepend, once and prependOnce reject the dangerous event keys and add no listener', () => {
            let emitter = new EventsManager();
            for(let methodName of ['on', 'prepend', 'once', 'prependOnce']){
                this.assert(
                    false === emitter[methodName]('__proto__', this.createListener([], methodName)),
                    methodName+' should reject the dangerous key'
                );
            }
            this.assert(0 === Object.keys(emitter._events).length, 'Should add no listener');
        });
    }

    testListenerMethodsThrowForInvalidTypesAndFunctions()
    {
        this.test('prepend, once and prependOnce throw a TypeError for invalid types and functions', () => {
            let emitter = new EventsManager();
            for(let methodName of ['prepend', 'once', 'prependOnce']){
                this.assertThrowsTypeError(
                    () => emitter[methodName](123, this.createListener([], methodName)),
                    methodName+' should throw for an invalid type'
                );
                this.assertThrowsTypeError(
                    () => emitter[methodName]('valid-event', 'not-a-function'),
                    methodName+' should throw for an invalid function'
                );
            }
            this.assert(0 === Object.keys(emitter._events).length, 'Should add no listener');
        });
    }

    testListenersOfAnUnknownEventReturnsAnEmptyArrayWithoutCaching()
    {
        this.test('listeners of an unknown event returns an empty array and caches nothing', () => {
            let emitter = new EventsManager();
            let result = emitter.listeners('unknown-event');
            this.assert(Array.isArray(result) && 0 === result.length, 'Should return an empty array');
            this.assert(0 === Object.keys(emitter._listenersCache).length, 'Should not cache the unknown event');
        });
    }

    testListenersOfDangerousNamesReturnEmptyArrays()
    {
        this.test('listeners of the object prototype names returns empty arrays', () => {
            let emitter = new EventsManager();
            for(let prototypeName of ['__proto__', 'constructor', 'toString', 'hasOwnProperty']){
                let result = emitter.listeners(prototypeName);
                this.assert(Array.isArray(result) && 0 === result.length, prototypeName+' should have no listeners');
            }
        });
    }

    testRemoveListenerOfAnUnregisteredFunctionReturnsFalse()
    {
        this.test('removeListener of an unregistered function returns false and keeps the listeners', async () => {
            let emitter = new EventsManager();
            let calls = [];
            emitter.on('unregistered-remove-event', this.createListener(calls, 'kept'));
            let result = emitter.removeListener('unregistered-remove-event', this.createListener(calls, 'other'));
            await emitter.emit('unregistered-remove-event');
            this.assert(false === result, 'Should return false');
            this.assert('kept' === calls.join(','), 'Should keep the registered listener');
        });
    }

    testRemoveListenerRemovesEveryRegistrationOfTheSameFunction()
    {
        this.test('removeListener removes every registration of the same function and the emptied event', () => {
            let emitter = new EventsManager();
            let repeatedListener = this.createListener([], 'repeated');
            emitter.on('repeated-remove-event', repeatedListener);
            emitter.on('repeated-remove-event', repeatedListener);
            this.assert(true === emitter.removeListener('repeated-remove-event', repeatedListener), 'Should return true');
            this.assert(!emitter._events['repeated-remove-event'], 'Should delete the emptied event');
        });
    }

    testRemoveListenerRejectsDangerousEventKeys()
    {
        this.test('removeListener rejects the dangerous event keys', () => {
            let emitter = new EventsManager();
            this.assert(false === emitter.removeListener('constructor'), 'Should reject the dangerous key');
        });
    }

    testRemoveListenerThrowsForInvalidTypes()
    {
        this.test('removeListener throws a TypeError for an invalid type', () => {
            let emitter = new EventsManager();
            this.assertThrowsTypeError(() => emitter.removeListener(123), 'Should throw for an invalid type');
        });
    }

    testRemoveListenerWithoutFunctionOfAnUnknownEventReturnsTrue()
    {
        this.test('removeListener without a function of an unknown event returns true', () => {
            let emitter = new EventsManager();
            this.assert(true === emitter.removeListener('unknown-remove-event'), 'Should return true');
        });
    }

    testRemoveAllListenersClearsTheRemoveKeys()
    {
        this.test('removeAllListeners clears the remove keys so they can be registered again', () => {
            let emitter = new EventsManager();
            emitter.onWithKey('reset-event', this.createListener([], 'plain'), 'reset-key');
            emitter.onWithKey('reset-event', this.createListener([], 'master'), 'reset-sub', 'reset-master');
            emitter.removeAllListeners();
            this.assert(0 === Object.keys(emitter.eventsByRemoveKeys).length, 'Should clear the remove keys');
            let newListener = this.createListener([], 'new');
            this.assert(newListener === emitter.onWithKey('reset-event', newListener, 'reset-key'), 'Should register');
        });
    }

    testEmitThrowsForInvalidTypes()
    {
        this.test('emit rejects with a TypeError for an invalid type', async () => {
            let emitter = new EventsManager();
            let thrownError = false;
            await emitter.emit(123).catch((error) => {
                thrownError = error;
            });
            this.assert(thrownError instanceof TypeError, 'Should reject with a TypeError');
        });
    }

    testEmitAndEmitSyncRejectDangerousEventKeys()
    {
        this.test('emit and emitSync return false for the dangerous event keys', async () => {
            let emitter = new EventsManager();
            this.assert(false === await emitter.emit('__proto__'), 'emit should return false');
            this.assert(false === emitter.emitSync('constructor'), 'emitSync should return false');
        });
    }

    testEmitCallsTheNextListenerWhenAListenerRemovesItself()
    {
        this.test('emit calls the next listener when a listener removes itself', async () => {
            let emitter = new EventsManager();
            let calls = [];
            let selfRemovingListener = () => {
                calls.push('self-removing');
                emitter.off('self-removing-event', selfRemovingListener);
            };
            emitter.on('self-removing-event', selfRemovingListener);
            emitter.on('self-removing-event', this.createListener(calls, 'next'));
            await emitter.emit('self-removing-event');
            await emitter.emit('self-removing-event');
            this.assert('self-removing,next,next' === calls.join(','), 'Should call the next listener every time');
        });
    }

    testEmitCallsEveryListenerRegisteredAtTheEmitStart()
    {
        this.test('emit calls every listener registered when it started even if one is removed meanwhile', async () => {
            let emitter = new EventsManager();
            let calls = [];
            let removedListener = this.createListener(calls, 'removed');
            emitter.on('snapshot-event', () => {
                calls.push('remover');
                emitter.off('snapshot-event', removedListener);
            });
            emitter.on('snapshot-event', removedListener);
            await emitter.emit('snapshot-event');
            await emitter.emit('snapshot-event');
            this.assert('remover,removed,remover' === calls.join(','), 'The removed listener should not run again');
        });
    }

    testEmitRemovesOnlyTheOnceRegistrationOfAFunction()
    {
        this.test('emit removes only the once registration of a function also registered with on', async () => {
            let emitter = new EventsManager();
            let calls = [];
            let sharedListener = this.createListener(calls, 'shared');
            emitter.on('mixed-once-event', sharedListener);
            emitter.once('mixed-once-event', sharedListener);
            await emitter.emit('mixed-once-event');
            await emitter.emit('mixed-once-event');
            this.assert(3 === calls.length, 'The on registration should be kept');
            this.assert(1 === emitter.listeners('mixed-once-event').length, 'Only the on registration should remain');
        });
    }

    testEmitRemovesAOnceListenerBeforeCallingIt()
    {
        this.test('emit removes a once listener before calling it so a nested emit does not call it again', async () => {
            let emitter = new EventsManager();
            let calls = [];
            emitter.once('nested-once-event', async () => {
                calls.push('once');
                await emitter.emit('nested-once-event');
            });
            await emitter.emit('nested-once-event');
            this.assert(1 === calls.length, 'The once listener should be called once');
        });
    }

    testEmitKeepsTheOnceListenersNotReachedWhenAListenerThrows()
    {
        this.test('emit keeps the once listeners not reached when a previous listener throws', async () => {
            let emitter = new EventsManager();
            emitter.on('throwing-event', () => {
                emitter.assertFn('not-a-function');
            });
            emitter.once('throwing-event', this.createListener([], 'not-reached'));
            let thrownError = false;
            await emitter.emit('throwing-event').catch((error) => {
                thrownError = error;
            });
            this.assert(thrownError instanceof TypeError, 'Should reject with the listener error');
            this.assert(2 === emitter.listeners('throwing-event').length, 'The once listener should be kept');
        });
    }

    testEmitWithTooManyArgumentsCallsTheListenersWithoutArguments()
    {
        this.test('emit with more arguments than the maximum calls the listeners without arguments', async () => {
            let emitter = new EventsManager();
            emitter.maxEventArgs = 1;
            let receivedArgsCount = -1;
            emitter.on('too-many-args-event', (...args) => {
                receivedArgsCount = args.length;
            });
            await emitter.emit('too-many-args-event', 1, 2);
            this.assert(0 === receivedArgsCount, 'Should call the listener without arguments');
        });
    }

    testEmitAwaitsTheAsyncListenersInOrder()
    {
        this.test('emit awaits the async listeners in their registration order', async () => {
            let emitter = new EventsManager();
            let calls = [];
            emitter.on('ordered-async-event', async () => {
                await Promise.resolve();
                calls.push('slow');
            });
            emitter.on('ordered-async-event', this.createListener(calls, 'fast'));
            await emitter.emit('ordered-async-event');
            this.assert('slow,fast' === calls.join(','), 'Should wait the slow listener before the next one');
        });
    }

    testEmitRejectsWhenAnAsyncListenerRejects()
    {
        this.test('emit rejects when an async listener rejects', async () => {
            let emitter = new EventsManager();
            emitter.on('rejecting-event', async () => {
                await Promise.resolve();
                emitter.assertFn('not-a-function');
            });
            let thrownError = false;
            await emitter.emit('rejecting-event').catch((error) => {
                thrownError = error;
            });
            this.assert(thrownError instanceof TypeError, 'Should reject with the listener error');
        });
    }

    testEmitSyncThrowsForInvalidTypes()
    {
        this.test('emitSync throws a TypeError for an invalid type', () => {
            let emitter = new EventsManager();
            this.assertThrowsTypeError(() => emitter.emitSync(123), 'Should throw for an invalid type');
        });
    }

    testEmitSyncReturnsWhetherItHadListeners()
    {
        this.test('emitSync returns false without listeners and true with listeners', () => {
            let emitter = new EventsManager();
            this.assert(false === emitter.emitSync('sync-empty-event'), 'Should return false without listeners');
            emitter.on('sync-empty-event', this.createListener([], 'sync'));
            this.assert(true === emitter.emitSync('sync-empty-event'), 'Should return true with listeners');
        });
    }

    testEmitSyncRemovesTheOnceListeners()
    {
        this.test('emitSync calls a once listener a single time', () => {
            let emitter = new EventsManager();
            let calls = [];
            emitter.once('sync-once-event', this.createListener(calls, 'once'));
            emitter.emitSync('sync-once-event');
            emitter.emitSync('sync-once-event');
            this.assert(1 === calls.length, 'Should call the once listener a single time');
        });
    }

    testEmitSyncCallsTheNextListenerWhenAListenerRemovesItself()
    {
        this.test('emitSync calls the next listener when a listener removes itself', () => {
            let emitter = new EventsManager();
            let calls = [];
            let selfRemovingListener = () => {
                calls.push('self-removing');
                emitter.off('sync-self-removing-event', selfRemovingListener);
            };
            emitter.on('sync-self-removing-event', selfRemovingListener);
            emitter.on('sync-self-removing-event', this.createListener(calls, 'next'));
            emitter.emitSync('sync-self-removing-event');
            this.assert('self-removing,next' === calls.join(','), 'Should call the next listener');
        });
    }

    testOnWithKeyRejectsMissingOrNonStringRemoveKeys()
    {
        this.test('onWithKey rejects missing, empty and non string remove keys and stores nothing', () => {
            let emitter = new EventsManager();
            for(let invalidKey of [null, '', 123]){
                this.assert(
                    false === emitter.onWithKey('missing-key-event', this.createListener([], 'invalid'), invalidKey),
                    'Should reject '+String(invalidKey)
                );
            }
            this.assert(
                false === emitter.onWithKey('missing-key-event', this.createListener([], 'missing')),
                'Should reject a missing key'
            );
            this.assert(0 === emitter.listeners('missing-key-event').length, 'Should add no listener');
            this.assert(0 === Object.keys(emitter.eventsByRemoveKeys).length, 'Should store no key');
        });
    }

    testOnWithKeyThrowsForANonFunctionCallbackAndStoresNoKey()
    {
        this.test('onWithKey throws a TypeError for a non function callback and stores no key', () => {
            let emitter = new EventsManager();
            this.assertThrowsTypeError(
                () => emitter.onWithKey('no-function-event', 'not-a-function', 'no-function-key'),
                'Should throw for the non function callback'
            );
            this.assert(!emitter.eventsByRemoveKeys['no-function-key'], 'Should store no key');
        });
    }

    testOnWithKeyRejectsAMasterKeyUsedAsARemoveKey()
    {
        this.test('onWithKey rejects a master key already used as a remove key and keeps that key', () => {
            let emitter = new EventsManager();
            let plainListener = this.createListener([], 'plain');
            emitter.onWithKey('collision-event', plainListener, 'collision-key');
            let result = emitter.onWithKey('collision-event-2', this.createListener([], 'sub'), 'sub', 'collision-key');
            this.assert(false === result, 'Should reject the master key');
            this.assert(plainListener === emitter.eventsByRemoveKeys['collision-key'].callback, 'Should keep the key');
            this.assert(!emitter.eventsByRemoveKeys['collision-key'].sub, 'Should not add keys to the plain key');
            this.assert(0 === emitter.listeners('collision-event-2').length, 'Should add no listener');
        });
    }

    testOnWithKeyRejectsARemoveKeyUsedAsAMasterKey()
    {
        this.test('onWithKey rejects a remove key already used as a master key and keeps the master', () => {
            let emitter = new EventsManager();
            emitter.onWithKey('master-collision-event', this.createListener([], 'sub'), 'sub', 'master-collision');
            let result = emitter.onWithKey('plain-collision-event', this.createListener([], 'plain'), 'master-collision');
            this.assert(false === result, 'Should reject the remove key');
            this.assert(emitter.eventsByRemoveKeys['master-collision'].sub, 'Should keep the master keys');
            this.assert(0 === emitter.listeners('plain-collision-event').length, 'Should add no listener');
        });
    }

    testOnWithKeyScopesTheKeysByMasterKey()
    {
        this.test('onWithKey accepts the same remove key under different master keys and without master key', () => {
            let emitter = new EventsManager();
            let calls = [];
            emitter.onWithKey('scoped-event', this.createListener(calls, 'plain'), 'scoped-key');
            emitter.onWithKey('scoped-event', this.createListener(calls, 'first'), 'scoped-key', 'scope-one');
            emitter.onWithKey('scoped-event', this.createListener(calls, 'second'), 'scoped-key', 'scope-two');
            emitter.emitSync('scoped-event');
            this.assert('plain,first,second' === calls.join(','), 'Should register the three listeners');
        });
    }

    testOnWithKeyReplacesTheStaleKeyOfARemovedListener()
    {
        this.test('onWithKey registers again the key of a listener removed with off', () => {
            let emitter = new EventsManager();
            let removedListener = this.createListener([], 'removed');
            let newListener = this.createListener([], 'new');
            emitter.onWithKey('stale-key-event', removedListener, 'stale-key');
            emitter.onWithKey('stale-key-event', removedListener, 'stale-sub', 'stale-master');
            emitter.off('stale-key-event', removedListener);
            this.assert(newListener === emitter.onWithKey('stale-key-event', newListener, 'stale-key'), 'Plain key');
            this.assert(
                newListener === emitter.onWithKey('stale-key-event', newListener, 'stale-sub', 'stale-master'),
                'Key under the master key'
            );
            this.assert(newListener === emitter.eventsByRemoveKeys['stale-key'].callback, 'Should store the new one');
        });
    }

    testOnWithKeyAndOffWithKeyWithSymbolEventNames()
    {
        this.test('onWithKey and offWithKey handle symbol event names', () => {
            let emitter = new EventsManager();
            let symbolEvent = Symbol('keyed-symbol-event');
            let calls = [];
            emitter.onWithKey(symbolEvent, this.createListener(calls, 'symbol'), 'symbol-key');
            emitter.emitSync(symbolEvent);
            this.assert(true === emitter.offWithKey('symbol-key'), 'Should remove the symbol listener');
            emitter.emitSync(symbolEvent);
            this.assert(1 === calls.length, 'Should not call the removed listener');
        });
    }

    testOffWithKeyOfAMasterKeyNameWithoutMasterKeyKeepsTheMaster()
    {
        this.test('offWithKey of a master key name without master key returns false and keeps the master', () => {
            let emitter = new EventsManager();
            let calls = [];
            emitter.onWithKey('kept-master-event', this.createListener(calls, 'kept'), 'kept-sub', 'kept-master');
            this.assert(false === emitter.offWithKey('kept-master'), 'Should return false');
            emitter.emitSync('kept-master-event');
            this.assert(emitter.eventsByRemoveKeys['kept-master']['kept-sub'], 'Should keep the master keys');
            this.assert(1 === calls.length, 'Should keep the listener');
        });
    }

    testOffWithKeyWithAPlainKeyAsMasterKeyReturnsFalse()
    {
        this.test('offWithKey with a plain remove key as master key returns false and keeps the key', () => {
            let emitter = new EventsManager();
            emitter.onWithKey('plain-master-event', this.createListener([], 'plain'), 'plain-as-master');
            this.assert(false === emitter.offWithKey('any-sub', 'plain-as-master'), 'Should return false');
            this.assert(emitter.eventsByRemoveKeys['plain-as-master'].callback, 'Should keep the plain key');
        });
    }

    testOffWithKeyWithAnInvalidStoredEventNameReturnsFalse()
    {
        this.test('offWithKey with an invalid stored event name returns false', () => {
            let emitter = new EventsManager();
            emitter.eventsByRemoveKeys['invalid-stored-key'] = {
                eventName: '__proto__',
                callback: this.createListener([], 'invalid')
            };
            this.assert(false === emitter.offWithKey('invalid-stored-key'), 'Should return false');
        });
    }

    testOffWithKeyTwiceReturnsFalseTheSecondTime()
    {
        this.test('offWithKey of an already removed key returns false', () => {
            let emitter = new EventsManager();
            emitter.onWithKey('twice-event', this.createListener([], 'twice'), 'twice-key');
            this.assert(true === emitter.offWithKey('twice-key'), 'The first removal should return true');
            this.assert(false === emitter.offWithKey('twice-key'), 'The second removal should return false');
        });
    }

    testOffByMasterKeyOfAPlainKeyReturnsFalseAndKeepsIt()
    {
        this.test('offByMasterKey of a plain remove key returns false and keeps its listener', () => {
            let emitter = new EventsManager();
            let calls = [];
            emitter.onWithKey('plain-by-master-event', this.createListener(calls, 'plain'), 'plain-by-master');
            this.assert(false === emitter.offByMasterKey('plain-by-master'), 'Should return false');
            emitter.emitSync('plain-by-master-event');
            this.assert(emitter.eventsByRemoveKeys['plain-by-master'], 'Should keep the plain key');
            this.assert(1 === calls.length, 'Should keep the listener');
        });
    }

    testOffByMasterKeyReturnsTrueAndOnlyRemovesItsKeys()
    {
        this.test('offByMasterKey returns true and keeps the other master keys', () => {
            let emitter = new EventsManager();
            let calls = [];
            emitter.onWithKey('shared-masters-event', this.createListener(calls, 'removed'), 'sub', 'removed-master');
            emitter.onWithKey('shared-masters-event', this.createListener(calls, 'kept'), 'sub', 'kept-master');
            this.assert(true === emitter.offByMasterKey('removed-master'), 'Should return true');
            emitter.emitSync('shared-masters-event');
            this.assert('kept' === calls.join(','), 'Should keep the listener of the other master key');
            this.assert(emitter.eventsByRemoveKeys['kept-master'], 'Should keep the other master key');
            this.assert(false === emitter.offByMasterKey('removed-master'), 'A second call should return false');
        });
    }

    testOffByMasterKeySkipsStoredEntriesWithInvalidEventNames()
    {
        this.test('offByMasterKey skips the stored entries with invalid event names and removes the others', () => {
            let emitter = new EventsManager();
            let calls = [];
            emitter.onWithKey('skipped-entry-event', this.createListener(calls, 'valid'), 'valid-sub', 'mixed-master');
            emitter.eventsByRemoveKeys['mixed-master']['invalid-sub'] = {
                eventName: 'constructor',
                callback: this.createListener(calls, 'invalid')
            };
            this.assert(true === emitter.offByMasterKey('mixed-master'), 'Should return true');
            emitter.emitSync('skipped-entry-event');
            this.assert(0 === calls.length, 'Should remove the valid entry listener');
            this.assert(!emitter.eventsByRemoveKeys['mixed-master'], 'Should remove the master key');
        });
    }

    testLogDebugEventWithSymbolKeysDoesNotThrow()
    {
        this.test('the debug log of symbol event keys does not throw', () => {
            let symbolEvent = Symbol('debug-symbol-event');
            for(let debugValue of ['all', 'other-pattern']){
                let emitter = new EventsManager();
                emitter.debug = debugValue;
                let captured = this.captureLogs(() => {
                    emitter.on(symbolEvent, this.createListener([], 'symbol'));
                    emitter.emit(symbolEvent);
                });
                this.assert(false === captured.callbackError, 'Should not throw with the debug '+debugValue);
            }
        });
    }

    testLogDebugEventWithDebugTrueLogsEveryEvent()
    {
        this.test('the debug set to true logs every event', () => {
            let emitter = new EventsManager();
            emitter.debug = true;
            let captured = this.captureLogs(() => emitter.on('debug-true-event', this.createListener([], 'debug')));
            this.assert(false === captured.callbackError, 'Should not throw');
            this.assert(
                captured.loggedMessages.some(message => message.includes('Listen Event: debug-true-event')),
                'Should log the event'
            );
        });
    }

    testLogDebugEventLogsAKeyContainingTheDebugValue()
    {
        this.test('logDebugEvent logs the keys containing the debug value and skips the others', () => {
            let emitter = new EventsManager();
            emitter.debug = 'player';
            let captured = this.captureLogs(() => {
                emitter.logDebugEvent('reldens.playerJoined', 'Fire');
                emitter.logDebugEvent('reldens.roomCreated', 'Fire');
            });
            this.assert(
                captured.loggedMessages.some(message => message.includes('Fire Event: reldens.playerJoined')),
                'Should log the matching key'
            );
            this.assert(
                !captured.loggedMessages.some(message => message.includes('reldens.roomCreated')),
                'Should skip the other key'
            );
        });
    }

    testLogDebugEventWithoutArgumentsDoesNotMentionArguments()
    {
        this.test('logDebugEvent without arguments does not mention the arguments', () => {
            let emitter = new EventsManager();
            emitter.debug = 'all';
            let captured = this.captureLogs(() => emitter.logDebugEvent('no-args-event', 'Fire', []));
            let eventLog = captured.loggedMessages.find(message => message.includes('Fire Event: no-args-event'));
            this.assert(eventLog, 'Should log the event');
            this.assert(!eventLog.includes('arguments'), 'Should not mention the arguments');
        });
    }

    printSummary()
    {
        let failedCount = this.testCount - this.passedCount;
        console.log('\n'+'='.repeat(60));
        console.log('EVENTS MANAGER TEST SUMMARY');
        console.log('='.repeat(60));
        console.log('Total: '+this.testCount+' | Passed: '+this.passedCount+' | Failed: '+failedCount);
        if(0 < failedCount){
            console.log('\nFailed tests:');
            for(let result of this.testResults){
                if('FAIL' === result.status){
                    console.log('  ✗ '+result.name+': '+result.error);
                }
            }
        }
        return failedCount;
    }

}

module.exports.TestEventsManager = TestEventsManager;
