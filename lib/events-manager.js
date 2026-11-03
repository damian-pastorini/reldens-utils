/**
 *
 * Reldens - EventsManager
 *
 */

const Logger = require('./logger');
const sc = require('./shortcuts');

class EventsManager
{

    constructor()
    {
        this._events = {};
        this.eventsByRemoveKeys = {};
        this.debug = false;
        this._listenersCache = {};
        this._validationCache = new Map();
        this._debugPatterns = null;
        this.maxEventKeyLength = 1000;
        this.maxValidationCacheSize = 10000;
        this.maxListeners = 10000;
        this.maxEventArgs = 50;
        this.sensitiveFields = ['password', 'token', 'secret', 'auth', 'credential'];
        this.hasLoggedMaxListeners = false;
        this.symbolString = '--[[await-event-emitter]]--';
        this.typeKeyName = sc.isFunction(Symbol) ? Symbol.for(this.symbolString) : this.symbolString;
        this.enableSensitiveDataFiltering = false;
    }

    assertType(type)
    {
        if(!sc.isString(type) && !sc.isSymbol(type)){
            throw new TypeError('type is not type of string or symbol!');
        }
    }

    assertFn(fn)
    {
        if(!sc.isFunction(fn)){
            throw new TypeError('fn is not type of Function!');
        }
    }

    alwaysListener(fn)
    {
        return {
            [this.typeKeyName]: 'always',
            fn
        };
    }

    onceListener(fn)
    {
        return {
            [this.typeKeyName]: 'once',
            fn
        };
    }

    validateEventKey(eventKey)
    {
        if(this._validationCache.has(eventKey)){
            return this._validationCache.get(eventKey);
        }
        if(sc.isString(eventKey) && eventKey.length > this.maxEventKeyLength){
            Logger.critical('Event key exceeds maximum length: '+eventKey.length);
            return this.cacheValidation(eventKey, false);
        }
        return this.cacheValidation(eventKey, !sc.hasDangerousKeys(null, eventKey));
    }

    cacheValidation(eventKey, isValid)
    {
        if(this._validationCache.size >= this.maxValidationCacheSize){
            this._validationCache.clear();
        }
        this._validationCache.set(eventKey, isValid);
        return isValid;
    }

    isValidRemoveKey(removeKey)
    {
        if(!sc.isString(removeKey) || '' === removeKey){
            return false;
        }
        return this.validateEventKey(removeKey);
    }

    sanitizeEventArgs(args)
    {
        if(!sc.isArray(args)){
            return [];
        }
        if(args.length > this.maxEventArgs){
            Logger.warning('Event arguments exceed maximum: '+args.length);
            return [];
        }
        if(!this.enableSensitiveDataFiltering){
            return args;
        }
        return args.map(arg => {
            if(sc.isObject(arg)){
                return this.filterSensitiveData(arg);
            }
            return arg;
        });
    }

    filterSensitiveData(obj, visited = new WeakSet())
    {
        if(!sc.isObject(obj)){
            return obj;
        }
        if(visited.has(obj)){
            return '[CIRCULAR]';
        }
        if(obj instanceof Map || obj instanceof Set || obj instanceof Date || obj instanceof Array){
            return obj;
        }
        if(Object.getPrototypeOf(obj) !== Object.prototype){
            return obj;
        }
        visited.add(obj);
        let filtered = {};
        for(let key of Object.keys(obj)){
            if(sc.hasDangerousKeys(null, key)){
                continue;
            }
            let isKeywordSensitive = this.sensitiveFields.some(sensitive =>
                key.toLowerCase().includes(sensitive.toLowerCase())
            );
            if(isKeywordSensitive){
                filtered[key] = '[FILTERED]';
                continue;
            }
            if(sc.isObject(obj[key])){
                filtered[key] = this.filterSensitiveData(obj[key], visited);
                continue;
            }
            if(sc.isFunction(obj[key])) {
                filtered[key] = obj[key];
                continue;
            }
            filtered[key] = obj[key];
        }
        visited.delete(obj);
        return filtered;
    }

    checkMemoryLeaks()
    {
        if(this.hasLoggedMaxListeners){
            return true;
        }
        let totalListeners = 0;
        for(let eventType of Object.keys(this._events)){
            totalListeners += this._events[eventType].length;
        }
        if(totalListeners > this.maxListeners){
            Logger.debug('High listener count detected: '+totalListeners+' total listeners');
            this.hasLoggedMaxListeners = true;
        }
        return true;
    }

    addListener(type, fn)
    {
        return this.on(type, fn);
    }

    on(type, fn)
    {
        this.assertType(type);
        this.assertFn(fn);
        if(!this.validateEventKey(type)){
            Logger.critical('Invalid event key detected: '+String(type));
            return false;
        }
        if(false !== this.debug){
            this.logDebugEvent(type, 'Listen');
        }
        this._events[type] = this._events[type] || [];
        this._events[type].push(this.alwaysListener(fn));
        delete this._listenersCache[type];
        this.checkMemoryLeaks();
        return this;
    }

    prependListener(type, fn)
    {
        return this.prepend(type, fn);
    }

    prepend(type, fn)
    {
        this.assertType(type);
        this.assertFn(fn);
        if(!this.validateEventKey(type)){
            Logger.critical('Invalid event key detected: '+String(type));
            return false;
        }
        this._events[type] = this._events[type] || [];
        this._events[type].unshift(this.alwaysListener(fn));
        delete this._listenersCache[type];
        this.checkMemoryLeaks();
        return this;
    }

    prependOnceListener(type, fn)
    {
        return this.prependOnce(type, fn);
    }

    prependOnce(type, fn)
    {
        this.assertType(type);
        this.assertFn(fn);
        if(!this.validateEventKey(type)){
            Logger.critical('Invalid event key detected: '+String(type));
            return false;
        }
        this._events[type] = this._events[type] || [];
        this._events[type].unshift(this.onceListener(fn));
        delete this._listenersCache[type];
        this.checkMemoryLeaks();
        return this;
    }

    listeners(type)
    {
        if(sc.hasOwn(this._listenersCache, type)){
            return this._listenersCache[type];
        }
        if(!sc.hasOwn(this._events, type)){
            return [];
        }
        let result = this._events[type].map((x) => x.fn);
        this._listenersCache[type] = result;
        return result;
    }

    once(type, fn)
    {
        this.assertType(type);
        this.assertFn(fn);
        if(!this.validateEventKey(type)){
            Logger.critical('Invalid event key detected: '+String(type));
            return false;
        }
        this._events[type] = this._events[type] || [];
        this._events[type].push(this.onceListener(fn));
        delete this._listenersCache[type];
        this.checkMemoryLeaks();
        return this;
    }

    removeAllListeners()
    {
        this._events = {};
        this._listenersCache = {};
        this.eventsByRemoveKeys = {};
    }

    off(type, nullOrFn)
    {
        return this.removeListener(type, nullOrFn);
    }

    removeListener(type, nullOrFn)
    {
        this.assertType(type);
        if(!this.validateEventKey(type)){
            Logger.critical('Invalid event key detected: '+String(type));
            return false;
        }
        let listeners = this.listeners(type);
        if(sc.isFunction(nullOrFn)){
            let index = -1;
            let found = false;
            while(-1 < (index = listeners.indexOf(nullOrFn))){
                listeners.splice(index, 1);
                this._events[type].splice(index, 1);
                found = true;
            }
            if(this._events[type] && 0 === this._events[type].length){
                delete this._events[type];
            }
            delete this._listenersCache[type];
            return found;
        }
        delete this._events[type];
        delete this._listenersCache[type];
        return true;
    }

    removeListenerObject(type, listenerObject)
    {
        if(!this._events[type]){
            return false;
        }
        let listenerIndex = this._events[type].indexOf(listenerObject);
        if(-1 === listenerIndex){
            return false;
        }
        this._events[type].splice(listenerIndex, 1);
        if(0 === this._events[type].length){
            delete this._events[type];
        }
        delete this._listenersCache[type];
        return true;
    }

    callListener(type, listenerObject, sanitizedArgs)
    {
        if('once' === listenerObject[this.typeKeyName]){
            this.removeListenerObject(type, listenerObject);
        }
        return listenerObject.fn.apply(this, sanitizedArgs);
    }

    async emit(type, ...args)
    {
        this.assertType(type);
        if(!this.validateEventKey(type)){
            Logger.critical('Invalid event key detected: '+String(type));
            return false;
        }
        let sanitizedArgs = this.sanitizeEventArgs(args);
        if(false !== this.debug){
            this.logDebugEvent(type, 'Fire', sanitizedArgs);
        }
        this.checkMemoryLeaks();
        let listenerObjects = [...(this._events[type] || [])];
        if(0 === listenerObjects.length){
            return false;
        }
        for(let listenerObject of listenerObjects){
            let listenerResult = this.callListener(type, listenerObject, sanitizedArgs);
            if(sc.isPromise(listenerResult)){
                await listenerResult;
            }
        }
        return true;
    }

    emitSync(type, ...args)
    {
        this.assertType(type);
        if(!this.validateEventKey(type)){
            Logger.critical('Invalid event key detected: '+String(type));
            return false;
        }
        let sanitizedArgs = this.sanitizeEventArgs(args);
        let listenerObjects = [...(this._events[type] || [])];
        if(0 === listenerObjects.length){
            return false;
        }
        for(let listenerObject of listenerObjects){
            this.callListener(type, listenerObject, sanitizedArgs);
        }
        return true;
    }

    isRemoveKeyEntry(removeKeyEntry)
    {
        return sc.isObject(removeKeyEntry) && sc.isFunction(removeKeyEntry.callback);
    }

    isRemoveKeyAvailable(uniqueRemoveKey, masterKey)
    {
        let keysOwner = masterKey ? sc.get(this.eventsByRemoveKeys, masterKey, {}) : this.eventsByRemoveKeys;
        if(masterKey && this.isRemoveKeyEntry(keysOwner)){
            Logger.critical('Master key "'+masterKey+'" is already used as a remove key.');
            return false;
        }
        if(!sc.hasOwn(keysOwner, uniqueRemoveKey)){
            return true;
        }
        let existingEntry = keysOwner[uniqueRemoveKey];
        if(!this.isRemoveKeyEntry(existingEntry)){
            Logger.debug('Remove key "'+uniqueRemoveKey+'" is already used as a master key.');
            return false;
        }
        let existingListeners = sc.get(this._events, existingEntry.eventName, []);
        if(existingListeners.some(listenerObject => existingEntry.callback === listenerObject.fn)){
            Logger.debug('Event "'+String(existingEntry.eventName)+'" exists with key "'+uniqueRemoveKey+'".');
            return false;
        }
        delete keysOwner[uniqueRemoveKey];
        return true;
    }

    validateRemoveKeys(uniqueRemoveKey, masterKey)
    {
        if(!this.isValidRemoveKey(uniqueRemoveKey)){
            Logger.critical('Invalid remove key detected: '+String(uniqueRemoveKey));
            return false;
        }
        if(masterKey && !this.isValidRemoveKey(masterKey)){
            Logger.critical('Invalid master key detected: '+String(masterKey));
            return false;
        }
        return true;
    }

    onWithKey(eventName, callback, uniqueRemoveKey, masterKey)
    {
        if(!this.validateEventKey(eventName)){
            Logger.critical('Invalid event key detected: '+String(eventName));
            return false;
        }
        if(!this.validateRemoveKeys(uniqueRemoveKey, masterKey)){
            return false;
        }
        if(!this.isRemoveKeyAvailable(uniqueRemoveKey, masterKey)){
            return false;
        }
        this.on(eventName, callback);
        if(!masterKey){
            this.eventsByRemoveKeys[uniqueRemoveKey] = {eventName, callback};
            return callback;
        }
        if(!sc.hasOwn(this.eventsByRemoveKeys, masterKey)){
            this.eventsByRemoveKeys[masterKey] = {};
        }
        this.eventsByRemoveKeys[masterKey][uniqueRemoveKey] = {eventName, callback};
        return callback;
    }

    offWithKey(uniqueRemoveKey, masterKey)
    {
        if(!this.validateRemoveKeys(uniqueRemoveKey, masterKey)){
            return false;
        }
        let keysOwner = masterKey ? sc.get(this.eventsByRemoveKeys, masterKey, false) : this.eventsByRemoveKeys;
        if(!keysOwner){
            Logger.debug('Event not found by masterKey "'+masterKey+'".');
            return false;
        }
        if(masterKey && this.isRemoveKeyEntry(keysOwner)){
            Logger.debug('The masterKey "'+masterKey+'" is a remove key.');
            return false;
        }
        let eventToRemove = sc.get(keysOwner, uniqueRemoveKey, false);
        if(!this.isRemoveKeyEntry(eventToRemove)){
            Logger.debug('Event not found by removeKey "'+uniqueRemoveKey+'".');
            return false;
        }
        if(!this.validateEventKey(eventToRemove.eventName)){
            Logger.critical('Invalid event name in stored event: '+String(eventToRemove.eventName));
            return false;
        }
        let dataArr = this.listeners(eventToRemove.eventName);
        let currentListenerIndex = dataArr.indexOf(eventToRemove.callback);
        if(-1 === currentListenerIndex){
            delete this._listenersCache[eventToRemove.eventName];
            this.deleteRemoveKey(uniqueRemoveKey, masterKey);
            Logger.debug('Event listener not found in _events array, the stale removeKey was deleted.');
            return false;
        }
        this._events[eventToRemove.eventName].splice(currentListenerIndex, 1);
        if(0 === this._events[eventToRemove.eventName].length){
            delete this._events[eventToRemove.eventName];
        }
        delete this._listenersCache[eventToRemove.eventName];
        return this.deleteRemoveKey(uniqueRemoveKey, masterKey);
    }

    deleteRemoveKey(uniqueRemoveKey, masterKey)
    {
        if(!masterKey){
            delete this.eventsByRemoveKeys[uniqueRemoveKey];
            Logger.debug('Deleted event by removeKey "'+uniqueRemoveKey+'".');
            return true;
        }
        delete this.eventsByRemoveKeys[masterKey][uniqueRemoveKey];
        if(0 === Object.keys(this.eventsByRemoveKeys[masterKey]).length){
            delete this.eventsByRemoveKeys[masterKey];
        }
        Logger.debug('Deleted event by removeKey "'+uniqueRemoveKey+'" and masterKey "'+masterKey+'".');
        return true;
    }

    offByMasterKey(masterKey)
    {
        if(!this.isValidRemoveKey(masterKey)){
            Logger.critical('Invalid master key detected: '+String(masterKey));
            return false;
        }
        let masterEntries = sc.get(this.eventsByRemoveKeys, masterKey, false);
        if(!masterEntries){
            Logger.debug('Events not found by masterKey "'+masterKey+'".');
            return false;
        }
        if(this.isRemoveKeyEntry(masterEntries)){
            Logger.debug('The masterKey "'+masterKey+'" is a remove key.');
            return false;
        }
        Logger.debug('Removing events by masterKey: '+masterKey, Object.keys(masterEntries));
        let eventsToRemove = Object.keys(masterEntries);
        let affectedEvents = new Set();
        for(let uniqueRemoveKey of eventsToRemove){
            let eventToRemove = masterEntries[uniqueRemoveKey];
            if(!this.validateEventKey(eventToRemove.eventName)){
                continue;
            }
            affectedEvents.add(eventToRemove.eventName);
            let dataArr = this.listeners(eventToRemove.eventName);
            let currentListenerIndex = dataArr.indexOf(eventToRemove.callback);
            if(-1 === currentListenerIndex){
                continue;
            }
            this._events[eventToRemove.eventName].splice(currentListenerIndex, 1);
            delete this._listenersCache[eventToRemove.eventName];
            if(0 === this._events[eventToRemove.eventName].length){
                delete this._events[eventToRemove.eventName];
            }
        }
        for(let eventName of affectedEvents){
            delete this._listenersCache[eventName];
        }
        delete this.eventsByRemoveKeys[masterKey];
        return true;
    }

    logDebugEvent(key, type, args = null)
    {
        let debugValue = true === this.debug ? 'all' : String(this.debug);
        if(!this._debugPatterns){
            this._debugPatterns = new Set(debugValue.split(','));
        }
        let keyName = String(key);
        if(!this._debugPatterns.has('all') && !this._debugPatterns.has(keyName) && -1 === keyName.indexOf(debugValue)){
            return;
        }
        let logMessage = type+' Event: '+keyName;
        if(args && 0 < args.length){
            let filteredArgs = this.enableSensitiveDataFiltering
                ? args.map(arg => this.filterSensitiveData(arg))
                : args;
            logMessage += ' with '+filteredArgs.length+' arguments';
        }
        Logger.debug(logMessage);
    }

}

module.exports = EventsManager;
