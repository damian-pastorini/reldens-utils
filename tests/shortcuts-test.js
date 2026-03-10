/**
 *
 * Reldens - TestShortcuts
 *
 */

const sc = require('../lib/shortcuts');

class TestShortcuts
{

    constructor()
    {
        this.testResults = [];
        this.testCount = 0;
        this.passedCount = 0;
        this.currentTestMethod = '';
    }

    test(name, testFn)
    {
        this.testCount++;
        try{
            testFn();
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
        console.log('Running tests for Shortcuts...\n');
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
            } catch(error){
                console.error('Test method failed:', methodName, error.message);
            }
        }
        let failed = this.printSummary();
        return {total: this.testCount, passed: this.passedCount, failed};
    }

    printSummary()
    {
        console.log('\n'+'='.repeat(60));
        console.log('SHORTCUTS TEST SUMMARY');
        console.log('='.repeat(60));
        let failedTests = this.testResults.filter(r => 'FAIL' === r.status);
        console.log('Total: '+this.testCount+' | Passed: '+this.passedCount+' | Failed: '+failedTests.length);
        if(0 < failedTests.length){
            console.log('\nFailed tests:');
            for(let failed of failedTests){
                console.log('  ✗ '+failed.name+': '+failed.error);
            }
        }
        return failedTests.length;
    }

    testHasOwn()
    {
        this.test('returns true for existing prop', () => {
            this.assert(sc.hasOwn({a: 1}, 'a'));
        });
        this.test('returns false for missing prop', () => {
            this.assert(!sc.hasOwn({a: 1}, 'b'));
        });
        this.test('returns false for undefined value', () => {
            this.assert(!sc.hasOwn({a: undefined}, 'a'));
        });
        this.test('accepts array of props - all present', () => {
            this.assert(sc.hasOwn({a: 1, b: 2}, ['a', 'b']));
        });
        this.test('accepts array of props - one missing', () => {
            this.assert(!sc.hasOwn({a: 1}, ['a', 'b']));
        });
        this.test('returns false for null obj', () => {
            this.assert(!sc.hasOwn(null, 'a'));
        });
    }

    testIsTrue()
    {
        this.test('returns true for truthy prop', () => {
            this.assert(sc.isTrue({a: 1}, 'a'));
        });
        this.test('returns false for falsy prop', () => {
            this.assert(!sc.isTrue({a: 0}, 'a'));
        });
        this.test('strict mode - true for boolean true', () => {
            this.assert(sc.isTrue({a: true}, 'a', true));
        });
        this.test('strict mode - false for truthy non-boolean', () => {
            this.assert(!sc.isTrue({a: 1}, 'a', true));
        });
        this.test('returns false for missing prop', () => {
            this.assert(!sc.isTrue({}, 'a'));
        });
    }

    testIsObject()
    {
        this.test('returns true for plain object', () => {
            this.assert(sc.isObject({a: 1}));
        });
        this.test('returns false for array', () => {
            this.assert(!sc.isObject([1, 2]));
        });
        this.test('returns false for null', () => {
            this.assert(!sc.isObject(null));
        });
        this.test('returns false for string', () => {
            this.assert(!sc.isObject('str'));
        });
        this.test('returns false for number', () => {
            this.assert(!sc.isObject(42));
        });
    }

    testIsArray()
    {
        this.test('returns true for array', () => {
            this.assert(sc.isArray([1, 2, 3]));
        });
        this.test('returns false for object', () => {
            this.assert(!sc.isArray({a: 1}));
        });
        this.test('returns true for empty array', () => {
            this.assert(sc.isArray([]));
        });
        this.test('returns false for string', () => {
            this.assert(!sc.isArray('abc'));
        });
    }

    testInArray()
    {
        this.test('returns true when value present', () => {
            this.assert(sc.inArray(2, [1, 2, 3]));
        });
        this.test('returns false when value absent', () => {
            this.assert(!sc.inArray(5, [1, 2, 3]));
        });
        this.test('returns false for non-array', () => {
            this.assert(!sc.inArray(1, 'not an array'));
        });
    }

    testIsNotEmptyArray()
    {
        this.test('returns true for non-empty array', () => {
            this.assert(sc.isNotEmptyArray([1]));
        });
        this.test('returns false for empty array', () => {
            this.assert(!sc.isNotEmptyArray([]));
        });
        this.test('returns false for non-array', () => {
            this.assert(!sc.isNotEmptyArray('abc'));
        });
    }

    testIsFunction()
    {
        this.test('returns true for function', () => {
            this.assert(sc.isFunction(() => {}));
        });
        this.test('returns false for non-function', () => {
            this.assert(!sc.isFunction(42));
        });
        this.test('returns false for null', () => {
            this.assert(!sc.isFunction(null));
        });
    }

    testIsObjectFunction()
    {
        this.test('returns true when property is a function', () => {
            this.assert(sc.isObjectFunction({fn: () => {}}, 'fn'));
        });
        this.test('returns false when property is not a function', () => {
            this.assert(!sc.isObjectFunction({a: 1}, 'a'));
        });
        this.test('returns false for non-object', () => {
            this.assert(!sc.isObjectFunction(null, 'fn'));
        });
    }

    testIsSymbol()
    {
        this.test('returns true for symbol', () => {
            this.assert(sc.isSymbol(Symbol('x')));
        });
        this.test('returns false for string', () => {
            this.assert(!sc.isSymbol('x'));
        });
    }

    testIsString()
    {
        this.test('returns true for string', () => {
            this.assert(sc.isString('hello'));
        });
        this.test('returns false for number', () => {
            this.assert(!sc.isString(42));
        });
        this.test('returns true for empty string', () => {
            this.assert(sc.isString(''));
        });
    }

    testIsNumber()
    {
        this.test('returns true for number', () => {
            this.assert(sc.isNumber(42));
        });
        this.test('returns true for float', () => {
            this.assert(sc.isNumber(3.14));
        });
        this.test('returns false for string', () => {
            this.assert(!sc.isNumber('42'));
        });
    }

    testIsInt()
    {
        this.test('returns true for integer', () => {
            this.assert(sc.isInt(5));
        });
        this.test('returns false for float', () => {
            this.assert(!sc.isInt(5.5));
        });
        this.test('returns false for string', () => {
            this.assert(!sc.isInt('5'));
        });
    }

    testIsFloat()
    {
        this.test('returns true for float', () => {
            this.assert(sc.isFloat(3.14));
        });
        this.test('returns false for integer', () => {
            this.assert(!sc.isFloat(3));
        });
        this.test('returns false for string', () => {
            this.assert(!sc.isFloat('3.14'));
        });
    }

    testIsBoolean()
    {
        this.test('returns true for true', () => {
            this.assert(sc.isBoolean(true));
        });
        this.test('returns true for false', () => {
            this.assert(sc.isBoolean(false));
        });
        this.test('returns false for 1', () => {
            this.assert(!sc.isBoolean(1));
        });
    }

    testIsPromise()
    {
        this.test('returns true for promise', () => {
            this.assert(sc.isPromise(Promise.resolve()));
        });
        this.test('returns true for thenable', () => {
            this.assert(sc.isPromise({then: () => {}}));
        });
        this.test('returns false for non-promise', () => {
            this.assert(!sc.isPromise(42));
        });
    }

    testHasDangerousKeys()
    {
        this.test('detects __proto__ key', () => {
            this.assert(sc.hasDangerousKeys(null, '__proto__'));
        });
        this.test('detects constructor key', () => {
            this.assert(sc.hasDangerousKeys(null, 'constructor'));
        });
        this.test('detects prototype key', () => {
            this.assert(sc.hasDangerousKeys(null, 'prototype'));
        });
        this.test('returns false for safe key', () => {
            this.assert(!sc.hasDangerousKeys(null, 'safeKey'));
        });
        this.test('detects dangerous key in object', () => {
            let obj = Object.create(null);
            obj['__proto__'] = {};
            this.assert(sc.hasDangerousKeys(obj));
        });
        this.test('returns false for safe object', () => {
            this.assert(!sc.hasDangerousKeys({a: 1}));
        });
    }

    testDeepMergeProperties()
    {
        this.test('merges flat objects', () => {
            let target = {a: 1};
            sc.deepMergeProperties(target, {b: 2});
            this.assert(1 === target.a && 2 === target.b);
        });
        this.test('merges nested objects', () => {
            let target = {a: {x: 1}};
            sc.deepMergeProperties(target, {a: {y: 2}});
            this.assert(1 === target.a.x && 2 === target.a.y);
        });
        this.test('overwrites scalar values', () => {
            let target = {a: 1};
            sc.deepMergeProperties(target, {a: 2});
            this.assert(2 === target.a);
        });
        this.test('returns false for non-objects', () => {
            this.assert(false === sc.deepMergeProperties(null, {a: 1}));
        });
        this.test('skips dangerous keys', () => {
            let target = {a: 1};
            let source = Object.create(null);
            source['__proto__'] = {evil: true};
            source['b'] = 2;
            sc.deepMergeProperties(target, source);
            this.assert(undefined === target['evil'] && 2 === target.b);
        });
    }

    testLength()
    {
        this.test('returns key count', () => {
            this.assert(2 === sc.length({a: 1, b: 2}));
        });
        this.test('returns 0 for empty object', () => {
            this.assert(0 === sc.length({}));
        });
        this.test('returns 0 for null', () => {
            this.assert(0 === sc.length(null));
        });
    }

    testStartsWith()
    {
        this.test('returns true when string starts with prefix', () => {
            this.assert(sc.startsWith('hello world', 'hello'));
        });
        this.test('returns false when it does not', () => {
            this.assert(!sc.startsWith('hello world', 'world'));
        });
        this.test('returns false for non-string', () => {
            this.assert(!sc.startsWith(42, '4'));
        });
    }

    testContains()
    {
        this.test('returns true when needle is found', () => {
            this.assert(sc.contains('hello world', 'world'));
        });
        this.test('returns false when not found', () => {
            this.assert(!sc.contains('hello', 'xyz'));
        });
        this.test('returns false for non-string', () => {
            this.assert(!sc.contains(42, '4'));
        });
    }

    testConvertObjectsArrayToObjectByKeys()
    {
        this.test('converts array to keyed object', () => {
            let result = sc.convertObjectsArrayToObjectByKeys([{id: 1, name: 'a'}, {id: 2, name: 'b'}], 'id');
            this.assert(result[1].name === 'a' && result[2].name === 'b');
        });
        this.test('returns empty object for empty array', () => {
            let result = sc.convertObjectsArrayToObjectByKeys([], 'id');
            this.assert(0 === Object.keys(result).length);
        });
        this.test('returns empty object for non-array', () => {
            let result = sc.convertObjectsArrayToObjectByKeys(null, 'id');
            this.assert(0 === Object.keys(result).length);
        });
    }

    testSortObjectKeysBy()
    {
        this.test('sorts keys by field ascending', () => {
            let obj = {b: {order: 2}, a: {order: 1}};
            let sorted = sc.sortObjectKeysBy(obj, 'order');
            this.assert('a' === sorted[0] && 'b' === sorted[1]);
        });
    }

    testArraySort()
    {
        this.test('sorts asc by field', () => {
            let arr = [{n: 3}, {n: 1}, {n: 2}];
            let sorted = sc.arraySort(arr, 'n');
            this.assert(1 === sorted[0].n && 3 === sorted[2].n);
        });
        this.test('sorts desc by field', () => {
            let arr = [{n: 1}, {n: 3}, {n: 2}];
            let sorted = sc.arraySort(arr, 'n', 'desc');
            this.assert(3 === sorted[0].n && 1 === sorted[2].n);
        });
        this.test('returns collection unchanged if no sortField', () => {
            let arr = [3, 1, 2];
            this.assert(arr === sc.arraySort(arr, null));
        });
    }

    testPropsAssign()
    {
        this.test('assigns listed props from source to target', () => {
            let from = {a: 1, b: 2, c: 3};
            let to = {};
            sc.propsAssign(from, to, ['a', 'c']);
            this.assert(1 === to.a && 3 === to.c && undefined === to.b);
        });
        this.test('returns to unchanged for non-array props', () => {
            let to = {};
            sc.propsAssign({a: 1}, to, null);
            this.assert(0 === Object.keys(to).length);
        });
    }

    testToJson()
    {
        this.test('parses valid JSON string', () => {
            let result = sc.toJson('{"a":1}');
            this.assert(1 === result.a);
        });
        this.test('returns default for invalid JSON', () => {
            this.assert(false === sc.toJson('invalid'));
        });
        this.test('returns custom default for invalid JSON', () => {
            this.assert(null === sc.toJson('invalid', null));
        });
    }

    testParseJson()
    {
        this.test('parses valid JSON', () => {
            let result = sc.parseJson('{"x":2}');
            this.assert(2 === result.x);
        });
        this.test('returns false for invalid JSON', () => {
            this.assert(false === sc.parseJson('{bad}'));
        });
        this.test('returns false for JSON with dangerous keys', () => {
            this.assert(false === sc.parseJson('{"__proto__":{"evil":true}}'));
        });
    }

    testDeepJsonClone()
    {
        this.test('clones object deeply', () => {
            let original = {a: {b: 1}};
            let clone = sc.deepJsonClone(original);
            clone.a.b = 99;
            this.assert(1 === original.a.b);
        });
    }

    testToJsonString()
    {
        this.test('stringifies object', () => {
            this.assert('{"a":1}' === sc.toJsonString({a: 1}));
        });
        this.test('accepts replacer and space args', () => {
            let result = sc.toJsonString({a: 1}, null, 2);
            this.assert(-1 !== result.indexOf('\n'));
        });
    }

    testGet()
    {
        this.test('returns value for existing prop', () => {
            this.assert(42 === sc.get({x: 42}, 'x'));
        });
        this.test('returns defaultReturn for missing prop', () => {
            this.assert('default' === sc.get({}, 'x', 'default'));
        });
        this.test('returns undefined default when not specified', () => {
            this.assert(undefined === sc.get({}, 'x'));
        });
    }

    testGetByPath()
    {
        this.test('gets nested value by path', () => {
            this.assert(5 === sc.getByPath({a: {b: 5}}, ['a', 'b']));
        });
        this.test('returns default for missing path', () => {
            this.assert('def' === sc.getByPath({a: {}}, ['a', 'b'], 'def'));
        });
        this.test('returns default for non-object', () => {
            this.assert('def' === sc.getByPath(null, ['a'], 'def'));
        });
        this.test('returns default for non-array path', () => {
            this.assert('def' === sc.getByPath({a: 1}, 'a', 'def'));
        });
    }

    testGetByPriority()
    {
        this.test('returns first found prop value', () => {
            this.assert(2 === sc.getByPriority({b: 2}, ['a', 'b']));
        });
        this.test('returns false if none found', () => {
            this.assert(false === sc.getByPriority({}, ['a', 'b']));
        });
        this.test('returns false for non-array propsArray', () => {
            this.assert(false === sc.getByPriority({a: 1}, null));
        });
    }

    testFetchByProperty()
    {
        this.test('returns first matching item', () => {
            let arr = [{id: 1}, {id: 2}];
            this.assert(2 === sc.fetchByProperty(arr, 'id', 2).id);
        });
        this.test('returns false when not found', () => {
            this.assert(false === sc.fetchByProperty([{id: 1}], 'id', 99));
        });
        this.test('returns false for non-array', () => {
            this.assert(false === sc.fetchByProperty(null, 'id', 1));
        });
        this.test('returns false for empty array', () => {
            this.assert(false === sc.fetchByProperty([], 'id', 1));
        });
    }

    testFetchAllByProperty()
    {
        this.test('returns all matching items', () => {
            let arr = [{t: 'a'}, {t: 'b'}, {t: 'a'}];
            let result = sc.fetchAllByProperty(arr, 't', 'a');
            this.assert(2 === result.length);
        });
        this.test('returns empty array when none match', () => {
            this.assert(0 === sc.fetchAllByProperty([{t: 'a'}], 't', 'z').length);
        });
        this.test('returns empty array for non-array', () => {
            this.assert(0 === sc.fetchAllByProperty(null, 't', 'a').length);
        });
    }

    testFetchByPropertyOnObject()
    {
        this.test('returns matching object value', () => {
            let obj = {x: {type: 'a'}, y: {type: 'b'}};
            this.assert('a' === sc.fetchByPropertyOnObject(obj, 'type', 'a').type);
        });
        this.test('returns false when not found', () => {
            this.assert(false === sc.fetchByPropertyOnObject({x: {type: 'a'}}, 'type', 'z'));
        });
        this.test('returns false for null', () => {
            this.assert(false === sc.fetchByPropertyOnObject(null, 'type', 'a'));
        });
    }

    testFetchAllByPropertyOnObject()
    {
        this.test('returns all matching values', () => {
            let obj = {x: {t: 'a'}, y: {t: 'b'}, z: {t: 'a'}};
            this.assert(2 === sc.fetchAllByPropertyOnObject(obj, 't', 'a').length);
        });
        this.test('returns empty array for null', () => {
            this.assert(0 === sc.fetchAllByPropertyOnObject(null, 't', 'a').length);
        });
    }

    testRemoveFromArray()
    {
        this.test('removes specified values', () => {
            let result = sc.removeFromArray([1, 2, 3, 4], [2, 4]);
            this.assert(2 === result.length && 1 === result[0] && 3 === result[1]);
        });
        this.test('returns original if none match', () => {
            let result = sc.removeFromArray([1, 2], [5]);
            this.assert(2 === result.length);
        });
    }

    testGetCurrentDate()
    {
        this.test('returns date string in Y-m-d H:i:s format', () => {
            let result = sc.getCurrentDate();
            this.assert('string' === typeof result && 19 === result.length);
        });
    }

    testGetDateForFileName()
    {
        this.test('returns date string safe for filenames', () => {
            let result = sc.getDateForFileName();
            this.assert('string' === typeof result && !result.includes(':'));
        });
    }

    testFormatDate()
    {
        this.test('formats date with default format', () => {
            let date = new Date(2024, 0, 15, 10, 5, 3);
            let result = sc.formatDate(date);
            this.assert('2024-01-15 10:05:03' === result);
        });
        this.test('returns input unchanged for non-Date', () => {
            this.assert('not-a-date' === sc.formatDate('not-a-date'));
        });
        this.test('supports custom format', () => {
            let date = new Date(2024, 5, 1, 0, 0, 0);
            this.assert('2024' === sc.formatDate(date, 'Y'));
        });
    }

    testGetTime()
    {
        this.test('returns a number', () => {
            this.assert('number' === typeof sc.getTime());
        });
        this.test('returns current timestamp approx', () => {
            let before = Date.now();
            let t = sc.getTime();
            let after = Date.now();
            this.assert(t >= before && t <= after);
        });
    }

    testRoundToPrecision()
    {
        this.test('rounds to 4 decimal places by default', () => {
            this.assert(3.1416 === sc.roundToPrecision(Math.PI));
        });
        this.test('rounds to custom precision', () => {
            this.assert(3.14 === sc.roundToPrecision(Math.PI, 2));
        });
    }

    testRandomValueFromArray()
    {
        this.test('returns a value from the array', () => {
            let arr = [1, 2, 3];
            this.assert(sc.inArray(sc.randomValueFromArray(arr), arr));
        });
        this.test('returns null for empty array', () => {
            this.assert(null === sc.randomValueFromArray([]));
        });
        this.test('returns null for non-array', () => {
            this.assert(null === sc.randomValueFromArray(null));
        });
    }

    testRandomInteger()
    {
        this.test('returns integer within range', () => {
            let result = sc.randomInteger(1, 10);
            this.assert(result >= 1 && result <= 10 && Number.isInteger(result));
        });
    }

    testRandomChars()
    {
        this.test('returns string of given length', () => {
            let result = sc.randomChars(8);
            this.assert('string' === typeof result && 8 === result.length);
        });
        this.test('returns empty string for length <= 0', () => {
            this.assert('' === sc.randomChars(0));
        });
    }

    testRandomCharsWithSymbols()
    {
        this.test('returns string of given length', () => {
            let result = sc.randomCharsWithSymbols(10);
            this.assert('string' === typeof result && 10 === result.length);
        });
        this.test('returns empty string for length <= 0', () => {
            this.assert('' === sc.randomCharsWithSymbols(0));
        });
    }

    testCleanMessage()
    {
        this.test('removes backslashes', () => {
            this.assert('helloworld' === sc.cleanMessage('hello\\world', 0));
        });
        this.test('replaces newlines with space', () => {
            this.assert('hello world' === sc.cleanMessage('hello\nworld', 0));
        });
        this.test('truncates to characterLimit', () => {
            this.assert('hel' === sc.cleanMessage('hello', 3));
        });
        this.test('returns empty string for falsy input', () => {
            this.assert('' === sc.cleanMessage(null, 0));
        });
    }

    testSlugify()
    {
        this.test('converts to lowercase slug', () => {
            this.assert('hello-world' === sc.slugify('Hello World'));
        });
        this.test('replaces & with and', () => {
            this.assert('bread-and-butter' === sc.slugify('Bread & Butter'));
        });
        this.test('removes special chars', () => {
            this.assert('test-123' === sc.slugify('test!@#123'));
        });
        this.test('returns empty string for falsy input', () => {
            this.assert('' === sc.slugify(''));
        });
    }

    testIsValidIsoCode()
    {
        this.test('returns true for 2-letter code', () => {
            this.assert(sc.isValidIsoCode('en'));
        });
        this.test('returns true for uppercase', () => {
            this.assert(sc.isValidIsoCode('EN'));
        });
        this.test('returns false for 3-letter code', () => {
            this.assert(!sc.isValidIsoCode('eng'));
        });
        this.test('returns false for numeric', () => {
            this.assert(!sc.isValidIsoCode('12'));
        });
    }

    testSanitize()
    {
        this.test('escapes &', () => {
            this.assert(-1 !== sc.sanitize('a&b').indexOf('&amp;'));
        });
        this.test('escapes <', () => {
            this.assert(-1 !== sc.sanitize('<script>').indexOf('&lt;'));
        });
        this.test('escapes >', () => {
            this.assert(-1 !== sc.sanitize('<>').indexOf('&gt;'));
        });
        this.test('returns empty string for falsy input', () => {
            this.assert('' === sc.sanitize(null));
        });
    }

    testSanitizeUrl()
    {
        this.test('returns valid http URL unchanged', () => {
            let url = 'http://example.com/path';
            this.assert(url === sc.sanitizeUrl(url));
        });
        this.test('returns valid https URL unchanged', () => {
            let url = 'https://example.com';
            this.assert(url === sc.sanitizeUrl(url));
        });
        this.test('returns empty string for javascript: URL', () => {
            this.assert('' === sc.sanitizeUrl('javascript:alert(1)'));
        });
        this.test('returns empty string for non-string', () => {
            this.assert('' === sc.sanitizeUrl(null));
        });
        this.test('returns empty string for too-long URL', () => {
            this.assert('' === sc.sanitizeUrl('https://example.com/' + 'a'.repeat(2050)));
        });
    }

    testCamelCase()
    {
        this.test('converts snake_case to camelCase', () => {
            this.assert('helloWorld' === sc.camelCase('hello_world'));
        });
        this.test('converts space-separated to camelCase', () => {
            this.assert('helloWorld' === sc.camelCase('hello world'));
        });
        this.test('returns input unchanged for non-string', () => {
            this.assert(42 === sc.camelCase(42));
        });
    }

    testCapitalizedCamelCase()
    {
        this.test('converts to CapitalizedCamelCase', () => {
            this.assert('HelloWorld' === sc.capitalizedCamelCase('hello_world'));
        });
        this.test('returns input unchanged for non-string', () => {
            this.assert(42 === sc.capitalizedCamelCase(42));
        });
    }

    testKebabCase()
    {
        this.test('converts underscores to hyphens', () => {
            this.assert('hello-world' === sc.kebabCase('hello_world'));
        });
        this.test('converts spaces to hyphens', () => {
            this.assert('hello-world' === sc.kebabCase('hello world'));
        });
    }

    testCapitalize()
    {
        this.test('capitalizes first letter and lowercases rest', () => {
            this.assert('Hello' === sc.capitalize('hELLO'));
        });
        this.test('returns input unchanged for non-string', () => {
            this.assert(42 === sc.capitalize(42));
        });
        this.test('returns empty string unchanged', () => {
            this.assert('' === sc.capitalize(''));
        });
    }

    testChunk()
    {
        this.test('splits array into chunks', () => {
            let result = sc.chunk([1, 2, 3, 4, 5], 2);
            this.assert(3 === result.length && 2 === result[0].length && 1 === result[2].length);
        });
        this.test('returns empty array for non-array', () => {
            this.assert(0 === sc.chunk(null, 2).length);
        });
        this.test('returns empty array for size <= 0', () => {
            this.assert(0 === sc.chunk([1, 2], 0).length);
        });
    }

    testFlatten()
    {
        this.test('flattens one level by default', () => {
            let result = sc.flatten([[1, 2], [3, 4]]);
            this.assert(4 === result.length && 1 === result[0]);
        });
        this.test('flattens to specified depth', () => {
            let result = sc.flatten([[[1]], [[2]]], 2);
            this.assert(2 === result.length);
        });
        this.test('returns empty array for non-array', () => {
            this.assert(0 === sc.flatten(null).length);
        });
    }

    testUnique()
    {
        this.test('removes duplicates', () => {
            let result = sc.unique([1, 2, 2, 3, 1]);
            this.assert(3 === result.length);
        });
        this.test('returns empty array for non-array', () => {
            this.assert(0 === sc.unique(null).length);
        });
    }

    testClamp()
    {
        this.test('clamps value within range', () => {
            this.assert(5 === sc.clamp(10, 0, 5));
        });
        this.test('returns min when below', () => {
            this.assert(0 === sc.clamp(-5, 0, 10));
        });
        this.test('returns value when within range', () => {
            this.assert(5 === sc.clamp(5, 0, 10));
        });
        this.test('returns value unchanged for non-number', () => {
            this.assert('x' === sc.clamp('x', 0, 10));
        });
    }

    testTruncate()
    {
        this.test('truncates with default suffix', () => {
            this.assert('hel...' === sc.truncate('hello world', 3));
        });
        this.test('returns original if within length', () => {
            this.assert('hi' === sc.truncate('hi', 10));
        });
        this.test('uses custom suffix', () => {
            this.assert('hel~' === sc.truncate('hello', 3, '~'));
        });
        this.test('returns input unchanged for non-string', () => {
            this.assert(42 === sc.truncate(42, 3));
        });
    }

    testPickProps()
    {
        this.test('picks specified props', () => {
            let result = sc.pickProps({a: 1, b: 2, c: 3}, ['a', 'c']);
            this.assert(1 === result.a && 3 === result.c && undefined === result.b);
        });
        this.test('returns empty object for non-object', () => {
            this.assert(0 === Object.keys(sc.pickProps(null, ['a'])).length);
        });
        this.test('skips dangerous keys', () => {
            let result = sc.pickProps({a: 1, constructor: 'hacked'}, ['constructor', 'a']);
            this.assert('hacked' !== result.constructor && 1 === result.a);
        });
    }

    testOmitProps()
    {
        this.test('omits specified props', () => {
            let result = sc.omitProps({a: 1, b: 2, c: 3}, ['b']);
            this.assert(undefined === result.b && 1 === result.a && 3 === result.c);
        });
        this.test('returns obj unchanged for non-array props', () => {
            let obj = {a: 1};
            this.assert(obj === sc.omitProps(obj, null));
        });
    }

    testDebounce()
    {
        this.test('returns a function', () => {
            this.assert('function' === typeof sc.debounce(() => {}, 100));
        });
        this.test('returns original func for invalid wait', () => {
            let fn = () => {};
            this.assert(fn === sc.debounce(fn, 'invalid'));
        });
    }

    testThrottle()
    {
        this.test('returns a function', () => {
            this.assert('function' === typeof sc.throttle(() => {}, 100));
        });
        this.test('returns original func for invalid limit', () => {
            let fn = () => {};
            this.assert(fn === sc.throttle(fn, 'invalid'));
        });
    }

    testIsValidUrl()
    {
        this.test('returns true for valid http URL', () => {
            this.assert(sc.isValidUrl('http://example.com'));
        });
        this.test('returns true for valid https URL', () => {
            this.assert(sc.isValidUrl('https://example.com/path?q=1'));
        });
        this.test('returns false for non-URL string', () => {
            this.assert(!sc.isValidUrl('not a url'));
        });
        this.test('returns false for non-string', () => {
            this.assert(!sc.isValidUrl(42));
        });
        this.test('returns false for too-long string', () => {
            this.assert(!sc.isValidUrl('https://x.com/' + 'a'.repeat(2050)));
        });
    }

    testIsValidInteger()
    {
        this.test('returns true for integer', () => {
            this.assert(sc.isValidInteger(5));
        });
        this.test('returns false for float', () => {
            this.assert(!sc.isValidInteger(5.5));
        });
        this.test('validates min boundary', () => {
            this.assert(!sc.isValidInteger(3, 5));
        });
        this.test('validates max boundary', () => {
            this.assert(!sc.isValidInteger(15, 0, 10));
        });
        this.test('returns true within range', () => {
            this.assert(sc.isValidInteger(5, 0, 10));
        });
    }

    testParseNumber()
    {
        this.test('parses integer string', () => {
            this.assert(42 === sc.parseNumber('42'));
        });
        this.test('parses float string', () => {
            this.assert(3.14 === sc.parseNumber('3.14'));
        });
        this.test('returns null for non-numeric', () => {
            this.assert(null === sc.parseNumber('abc'));
        });
        this.test('returns null for empty string', () => {
            this.assert(null === sc.parseNumber(''));
        });
        this.test('returns null for null', () => {
            this.assert(null === sc.parseNumber(null));
        });
    }

    testSplitToArray()
    {
        this.test('splits comma-separated string', () => {
            let result = sc.splitToArray('a, b, c');
            this.assert(3 === result.length && 'a' === result[0]);
        });
        this.test('uses custom separator', () => {
            let result = sc.splitToArray('a|b|c', '|');
            this.assert(3 === result.length);
        });
        this.test('returns null for empty string', () => {
            this.assert(null === sc.splitToArray(''));
        });
        this.test('returns null for non-string', () => {
            this.assert(null === sc.splitToArray(null));
        });
        this.test('filters empty segments', () => {
            let result = sc.splitToArray('a,,b', ',');
            this.assert(2 === result.length);
        });
    }

    testIsSecurePath()
    {
        this.test('returns true for normal path', () => {
            this.assert(sc.isSecurePath('uploads/file.txt'));
        });
        this.test('returns false for path traversal', () => {
            this.assert(!sc.isSecurePath('../etc/passwd'));
        });
        this.test('returns false for /etc/ path', () => {
            this.assert(!sc.isSecurePath('/etc/passwd'));
        });
        this.test('returns false for non-string', () => {
            this.assert(!sc.isSecurePath(null));
        });
        this.test('returns false for too-long path', () => {
            this.assert(!sc.isSecurePath('a'.repeat(2049)));
        });
    }

    testValidateInput()
    {
        this.test('validates email', () => {
            this.assert(sc.validateInput('test@example.com', 'email'));
        });
        this.test('rejects invalid email', () => {
            this.assert(!sc.validateInput('not-an-email', 'email'));
        });
        this.test('validates username', () => {
            this.assert(sc.validateInput('user_123', 'username'));
        });
        this.test('validates alphanumeric', () => {
            this.assert(sc.validateInput('abc123', 'alphanumeric'));
        });
        this.test('validates numeric', () => {
            this.assert(sc.validateInput('12345', 'numeric'));
        });
        this.test('validates hexColor', () => {
            this.assert(sc.validateInput('#FF5733', 'hexColor'));
        });
        this.test('validates ipv4', () => {
            this.assert(sc.validateInput('192.168.1.1', 'ipv4'));
        });
        this.test('returns false for unknown type', () => {
            this.assert(!sc.validateInput('anything', 'unknownType'));
        });
        this.test('returns false for non-string input', () => {
            this.assert(!sc.validateInput(42, 'numeric'));
        });
    }

    testSerializeFormData()
    {
        this.test('serializes single values', () => {
            let formData = [['name', 'Alice'], ['age', '30']];
            let result = sc.serializeFormData(formData);
            this.assert('Alice' === result.name && '30' === result.age);
        });
        this.test('serializes repeated keys into array', () => {
            let formData = [['tag', 'a'], ['tag', 'b']];
            let result = sc.serializeFormData(formData);
            this.assert(sc.isArray(result.tag) && 2 === result.tag.length);
        });
        this.test('returns empty object for empty formData', () => {
            let result = sc.serializeFormData([]);
            this.assert(0 === Object.keys(result).length);
        });
    }

}

module.exports = { TestShortcuts };
