const AwaitEventEmitterExtended = require('../lib/events-manager');

class TestAwaitEventEmitterExtended
{

    constructor()
    {
        this.testResults = [];
        this.testCount = 0;
        this.passedCount = 0;
    }

    test(name, testFn)
    {
        this.testCount++;
        try{
            testFn();
            console.log('✓ PASS:', name);
            this.passedCount++;
            this.testResults.push({name, status: 'PASS'});
        } catch(error){
            console.log('✗ FAIL:', name, '-', error.message);
            this.testResults.push({name, status: 'FAIL', error: error.message});
        }
    }

    assert(condition, message)
    {
        if(!condition){
            throw new Error(message || 'Assertion failed');
        }
    }

    runAllTests()
    {
        console.log('Running tests for AwaitEventEmitterExtended...\n');

        this.testConstructorCreatesInstance();
        this.testBasicOnEmitFunctionality();
        this.testMultipleListenersForSameEvent();
        this.testOnceListenerRemovesAfterFirstCall();
        this.testPrependListenerAddsToBeginning();
        this.testPrependOnceListener();
        this.testListenersMethodReturnsArrayOfFunctions();
        this.testRemoveListenerRemovesSpecificFunction();
        this.testRemoveListenerRemovesAllIfNoFunctionSpecified();
        this.testRemoveAllListenersClearsAllEvents();
        this.testOffAliasWorksLikeRemoveListener();
        this.testAddListenerAliasWorksLikeOn();
        this.testPrependListenerAliasWorksLikePrepend();
        this.testPrependOnceListenerAliasWorksLikePrependOnce();
        this.testOnWithKeyBasicFunctionality();
        this.testOffWithKeyRemovesByKey();
        this.testOnWithKeyWithMasterKey();
        this.testOffWithKeyWithMasterKey();
        this.testOffByMasterKeyRemovesAllEventsUnderMasterKey();
        this.testEmitSyncWorksWithoutAwait();
        this.testDebugFunctionalityLogsEvents();
        this.testAsyncListenersWithPromises();
        this.testInvalidEventKeyThrowsError();
        this.testInvalidFunctionThrowsError();
        this.testDangerousKeysRejectedByOnWithKey();
        this.testMissingParametersHandledGracefully();
        this.testOffWithKeyWithNonExistentKeyReturnsFalse();
        this.testOffByMasterKeyWithNonExistentMasterKeyReturnsFalse();
        this.testDuplicateKeyRegistrationReturnsFalse();
        this.testEmptyEventNameHandled();
        this.testSymbolEventKeysWork();
        this.testEmitWithNoListenersReturnsFalse();
        this.testEmitWithListenersReturnsTrue();

        this.printSummary();
    }

    testConstructorCreatesInstance()
    {
        this.test('Constructor creates instance', () => {
            let emitter = new AwaitEventEmitterExtended();
            this.assert(emitter instanceof AwaitEventEmitterExtended, 'Should create instance');
            this.assert('object' === typeof emitter._events, 'Should have _events object');
            this.assert('object' === typeof emitter.eventsByRemoveKeys, 'Should have eventsByRemoveKeys object');
            this.assert(false === emitter.debug, 'Should have debug false by default');
        });
    }

    testBasicOnEmitFunctionality()
    {
        this.test('Basic on/emit functionality', async () => {
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
            let called = false;

            emitter.addListener('add-test', () => called = true);

            await emitter.emit('add-test');
            this.assert(called, 'AddListener should work like on');
        });
    }

    testPrependListenerAliasWorksLikePrepend()
    {
        this.test('PrependListener alias works like prepend', async () => {
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
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

    testEmitSyncWorksWithoutAwait()
    {
        this.test('EmitSync works without await', () => {
            let emitter = new AwaitEventEmitterExtended();
            let called = false;

            emitter.on('sync-test', () => called = true);
            emitter.emitSync('sync-test');

            this.assert(called, 'EmitSync should call listeners immediately');
        });
    }

    testDebugFunctionalityLogsEvents()
    {
        this.test('Debug functionality logs events', async () => {
            let emitter = new AwaitEventEmitterExtended();
            let loggedEvents = [];
            let originalLog = console.log;

            console.log = (...args) => loggedEvents.push(args.join(' '));
            process.env.RELDENS_LOG_LEVEL = 8;
            emitter.debug = 'all';

            emitter.on('debug-test', () => {});
            await emitter.emit('debug-test');

            console.log = originalLog;
            delete process.env.RELDENS_LOG_LEVEL;

            let hasListenLog = loggedEvents.some(log => log.includes('Listen Event:'));
            let hasFireLog = loggedEvents.some(log => log.includes('Fire Event:'));
            this.assert(hasListenLog, 'Should log listen events');
            this.assert(hasFireLog, 'Should log fire events');
        });
    }

    testAsyncListenersWithPromises()
    {
        this.test('Async listeners with promises', async () => {
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
            let result = emitter.onWithKey('__proto__', () => {}, 'test-key');
            this.assert(false === result, 'Should reject dangerous keys');
        });
    }

    testMissingParametersHandledGracefully()
    {
        this.test('Missing parameters handled gracefully', () => {
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
            let result = emitter.offWithKey('non-existent-key');
            this.assert(false === result, 'Should return false for non-existent key');
        });
    }

    testOffByMasterKeyWithNonExistentMasterKeyReturnsFalse()
    {
        this.test('offByMasterKey with non-existent master key returns false', () => {
            let emitter = new AwaitEventEmitterExtended();
            let result = emitter.offByMasterKey('non-existent-master');
            this.assert(false === result, 'Should return false for non-existent master key');
        });
    }

    testDuplicateKeyRegistrationReturnsFalse()
    {
        this.test('Duplicate key registration returns false', () => {
            let emitter = new AwaitEventEmitterExtended();
            emitter.onWithKey('dup-test', () => {}, 'dup-key');
            let result = emitter.onWithKey('dup-test2', () => {}, 'dup-key');
            this.assert(false === result, 'Should return false for duplicate key');
        });
    }

    testEmptyEventNameHandled()
    {
        this.test('Empty event name handled', () => {
            let emitter = new AwaitEventEmitterExtended();
            let called = false;

            emitter.on('', () => called = true);
            emitter.emit('');

            this.assert(called, 'Should handle empty string event names');
        });
    }

    testSymbolEventKeysWork()
    {
        this.test('Symbol event keys work', () => {
            let emitter = new AwaitEventEmitterExtended();
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
            let emitter = new AwaitEventEmitterExtended();
            let result = await emitter.emit('no-listeners');
            this.assert(false === result, 'Should return false when no listeners');
        });
    }

    testEmitWithListenersReturnsTrue()
    {
        this.test('Emit with listeners returns true', async () => {
            let emitter = new AwaitEventEmitterExtended();
            emitter.on('has-listeners', () => {});
            let result = await emitter.emit('has-listeners');
            this.assert(true === result, 'Should return true when has listeners');
        });
    }

    printSummary()
    {
        console.log('\n'+'='.repeat(50));
        console.log('TEST SUMMARY');
        console.log('='.repeat(50));
        console.log('Total tests:', this.testCount);
        console.log('Passed:', this.passedCount);
        console.log('Failed:', this.testCount - this.passedCount);
        console.log('Success rate:', Math.round((this.passedCount / this.testCount) * 100)+'%');

        if(this.testCount - this.passedCount > 0){
            console.log('\nFailed tests:');
            for(let result of this.testResults){
                if('FAIL' === result.status){
                    console.log('-', result.name, ':', result.error);
                }
            }
        }
    }

}

let testRunner = new TestAwaitEventEmitterExtended();

testRunner.runAllTests();
