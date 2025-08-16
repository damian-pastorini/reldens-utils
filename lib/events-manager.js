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
        this.maxListeners = 10000;
        this.maxEventArgs = 50;
        this.sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
        this.hasLoggedMaxListeners = false;
        this.symbolString = '--[[await-event-emitter]]--';
        this.typeKeyName = sc.isFunction(Symbol) ? Symbol.for(this.symbolString) : this.symbolString;
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
            this._validationCache.set(eventKey, false);
            return false;
        }
        let isValid = !sc.hasDangerousKeys(null, eventKey);
        this._validationCache.set(eventKey, isValid);
        return isValid;
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
            Logger.critical('Invalid event key detected: '+type);
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
            Logger.critical('Invalid event key detected: '+type);
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
            Logger.critical('Invalid event key detected: '+type);
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
        if(this._listenersCache[type]){
            return this._listenersCache[type];
        }
        let result = (this._events[type] || []).map((x) => x.fn);
        this._listenersCache[type] = result;
        return result;
    }

    once(type, fn)
    {
        this.assertType(type);
        this.assertFn(fn);
        if(!this.validateEventKey(type)){
            Logger.critical('Invalid event key detected: '+type);
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
    }

    off(type, nullOrFn)
    {
        return this.removeListener(type, nullOrFn);
    }

    removeListener(type, nullOrFn)
    {
        this.assertType(type);
        if(!this.validateEventKey(type)){
            Logger.critical('Invalid event key detected: '+type);
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
            delete this._listenersCache[type];
            return found;
        }
        delete this._events[type];
        delete this._listenersCache[type];
        return true;
    }

    async emit(type, ...args)
    {
        this.assertType(type);
        if(!this.validateEventKey(type)){
            Logger.critical('Invalid event key detected: '+type);
            return false;
        }
        let sanitizedArgs = this.sanitizeEventArgs(args);
        if(false !== this.debug){
            this.logDebugEvent(type, 'Fire', sanitizedArgs);
        }
        this.checkMemoryLeaks();
        let listeners = this.listeners(type);
        let onceListeners = [];
        if(listeners && listeners.length){
            for(let i = 0; i < listeners.length; i++){
                let event = listeners[i];
                let rlt = event.apply(this, sanitizedArgs);
                if(sc.isPromise(rlt)){
                    await rlt;
                }
                if(this._events[type] && this._events[type][i] && 'once' === this._events[type][i][this.typeKeyName]){
                    onceListeners.push(event);
                }
            }
            for(let event of onceListeners){
                this.removeListener(type, event);
            }
            return true;
        }
        return false;
    }

    emitSync(type, ...args)
    {
        this.assertType(type);
        if(!this.validateEventKey(type)){
            Logger.critical('Invalid event key detected: '+type);
            return false;
        }
        let sanitizedArgs = this.sanitizeEventArgs(args);
        let listeners = this.listeners(type);
        let onceListeners = [];
        if(listeners && listeners.length){
            for(let i = 0; i < listeners.length; i++){
                let event = listeners[i];
                event.apply(this, sanitizedArgs);
                if(this._events[type] && this._events[type][i] && 'once' === this._events[type][i][this.typeKeyName]){
                    onceListeners.push(event);
                }
            }
            for(let event of onceListeners){
                this.removeListener(type, event);
            }
            return true;
        }
        return false;
    }

    onWithKey(eventName, callback, uniqueRemoveKey, masterKey)
    {
        if(!this.validateEventKey(eventName)){
            Logger.critical('Invalid event key detected: '+eventName);
            return false;
        }
        if(!this.validateEventKey(uniqueRemoveKey)){
            Logger.critical('Invalid remove key detected: '+uniqueRemoveKey);
            return false;
        }
        if(masterKey && !this.validateEventKey(masterKey)){
            Logger.critical('Invalid master key detected: '+masterKey);
            return false;
        }
        if(sc.hasOwn(this.eventsByRemoveKeys, uniqueRemoveKey)){
            Logger.debug('Event "'+eventName+'" exists with key "'+uniqueRemoveKey+'".');
            return false;
        }
        if(masterKey && sc.hasOwn(this.eventsByRemoveKeys, masterKey) && sc.hasOwn(this.eventsByRemoveKeys[masterKey], uniqueRemoveKey)){
            Logger.debug('Event "'+eventName+'" exists with key "'+uniqueRemoveKey+'" and masterKey "'+masterKey+'".');
            return false;
        }
        this.on(eventName, callback);
        let dataArr = this.listeners(eventName);
        let currentListenerIndex = dataArr.indexOf(callback);
        let currentListener = dataArr[currentListenerIndex];
        if(!masterKey){
            this.eventsByRemoveKeys[uniqueRemoveKey] = {eventName, callback};
            return currentListener;
        }
        if(!sc.hasOwn(this.eventsByRemoveKeys, masterKey)){
            this.eventsByRemoveKeys[masterKey] = {};
        }
        this.eventsByRemoveKeys[masterKey][uniqueRemoveKey] = {eventName, callback};
        return currentListener;
    }

    offWithKey(uniqueRemoveKey, masterKey)
    {
        if(!this.validateEventKey(uniqueRemoveKey)){
            Logger.critical('Invalid remove key detected: '+uniqueRemoveKey);
            return false;
        }
        if(masterKey && !this.validateEventKey(masterKey)){
            Logger.critical('Invalid master key detected: '+masterKey);
            return false;
        }
        if(masterKey && !sc.hasOwn(this.eventsByRemoveKeys, masterKey)){
            Logger.debug('Event not found by masterKey "'+masterKey+'".');
            return false;
        }
        if(!masterKey && !sc.hasOwn(this.eventsByRemoveKeys, uniqueRemoveKey)){
            Logger.debug('Event not found by removeKey "'+uniqueRemoveKey+'".');
            return false;
        }
        let eventToRemove = masterKey
            ? this.eventsByRemoveKeys[masterKey][uniqueRemoveKey]
            : this.eventsByRemoveKeys[uniqueRemoveKey];

        if(!this.validateEventKey(eventToRemove.eventName)){
            Logger.critical('Invalid event name in stored event: '+eventToRemove.eventName);
            return false;
        }
        let dataArr = this.listeners(eventToRemove.eventName);
        let currentListenerIndex = dataArr.indexOf(eventToRemove.callback);
        if(-1 === currentListenerIndex){
            Logger.debug('Event listener not found in _events array.');
            return false;
        }
        this._events[eventToRemove.eventName].splice(currentListenerIndex, 1);
        if(0 === this._events[eventToRemove.eventName].length){
            delete this._events[eventToRemove.eventName];
        }
        delete this._listenersCache[eventToRemove.eventName];
        if(masterKey){
            delete this.eventsByRemoveKeys[masterKey][uniqueRemoveKey];
            Logger.debug('Deleted event by removeKey "'+uniqueRemoveKey+'" and masterKey "'+masterKey+'".');
            return true;
        }
        delete this.eventsByRemoveKeys[uniqueRemoveKey];
        Logger.debug('Deleted event by removeKey "'+uniqueRemoveKey+'".');
        return true;
    }

    offByMasterKey(masterKey)
    {
        if(!this.validateEventKey(masterKey)){
            Logger.critical('Invalid master key detected: '+masterKey);
            return false;
        }
        if(!sc.hasOwn(this.eventsByRemoveKeys, masterKey)){
            Logger.debug('Events not found by masterKey "'+masterKey+'".');
            return false;
        }
        Logger.debug('Removing events by masterKey: '+masterKey, Object.keys(this.eventsByRemoveKeys[masterKey]));
        let eventsToRemove = Object.keys(this.eventsByRemoveKeys[masterKey]);
        let affectedEvents = new Set();
        for(let uniqueRemoveKey of eventsToRemove){
            let eventToRemove = this.eventsByRemoveKeys[masterKey][uniqueRemoveKey];
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
            if(0 === this._events[eventToRemove.eventName].length){
                delete this._events[eventToRemove.eventName];
            }
        }
        for(let eventName of affectedEvents){
            delete this._listenersCache[eventName];
        }
        delete this.eventsByRemoveKeys[masterKey];
    }

    logDebugEvent(key, type, args = null)
    {
        if(!this._debugPatterns){
            this._debugPatterns = new Set(this.debug.split(','));
        }
        if(!this._debugPatterns.has('all') && !this._debugPatterns.has(key) && -1 === key.indexOf(this.debug)){
            return;
        }
        let logMessage = type+' Event: '+key;
        if(args && 0 < args.length){
            let filteredArgs = args.map(arg => this.filterSensitiveData(arg));
            logMessage += ' with '+filteredArgs.length+' arguments';
        }
        Logger.debug(logMessage);
    }

}

module.exports = EventsManager;
