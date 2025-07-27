/**
 *
 * Reldens - EventsManager
 *
 */

const Logger = require('./logger');
const sc = require('./shortcuts');

class EventsManager
{

    static TYPE_KEY_NAME = 'symbol' === typeof Symbol
        ? Symbol.for('--[[await-event-emitter]]--')
        : '--[[await-event-emitter]]--';

    constructor()
    {
        this._events = {};
        this.eventsByRemoveKeys = {};
        this.debug = false;
        this._listenersCache = {};
        this._validationCache = new Map();
        this._debugPatterns = null;
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
            [EventsManager.TYPE_KEY_NAME]: 'always',
            fn
        };
    }

    onceListener(fn)
    {
        return {
            [EventsManager.TYPE_KEY_NAME]: 'once',
            fn
        };
    }

    validateEventKey(eventKey)
    {
        if(this._validationCache.has(eventKey)){
            return this._validationCache.get(eventKey);
        }
        let isValid = !sc.hasDangerousKeys(null, eventKey);
        this._validationCache.set(eventKey, isValid);
        return isValid;
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
        if(false !== this.debug){
            this.logDebugEvent(type, 'Fire');
        }
        let listeners = this.listeners(type);
        let onceListeners = [];
        if(listeners && listeners.length){
            for(let i = 0; i < listeners.length; i++){
                let event = listeners[i];
                let rlt = event.apply(this, args);
                if(sc.isPromise(rlt)){
                    await rlt;
                }
                if(this._events[type] && this._events[type][i] && 'once' === this._events[type][i][EventsManager.TYPE_KEY_NAME]){
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
        let listeners = this.listeners(type);
        let onceListeners = [];
        if(listeners && listeners.length){
            for(let i = 0; i < listeners.length; i++){
                let event = listeners[i];
                event.apply(this, args);
                if(this._events[type] && this._events[type][i] && 'once' === this._events[type][i][EventsManager.TYPE_KEY_NAME]){
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
        if(!this.validateEventKey(eventName) || !this.validateEventKey(uniqueRemoveKey)){
            Logger.critical('Invalid event key detected: '+eventName+' or '+uniqueRemoveKey);
            return false;
        }
        if(masterKey && !this.validateEventKey(masterKey)){
            Logger.critical('Invalid master key detected: '+masterKey);
            return false;
        }
        if(
            sc.hasOwn(this.eventsByRemoveKeys, uniqueRemoveKey)
            || (
                masterKey
                && sc.hasOwn(this.eventsByRemoveKeys, masterKey)
                && sc.hasOwn(this.eventsByRemoveKeys[masterKey], uniqueRemoveKey)
            )
        ){
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

    /**
     * This method will remove a SINGLE event using the unique remove key.
     * If the event listener was assigned using a masterKey then we need to pass it as well to find the event.
     */
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

    /**
     * This method will remove ALL the events below the specified masterKey.
     */
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
        // @NOTE: we loop all the events related to the masterKey and remove them one by one since the _events property
        // is an object with multiple listeners attached.
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

    logDebugEvent(key, type)
    {
        if(!this._debugPatterns){
            this._debugPatterns = new Set(this.debug.split(','));
        }
        if(
            this._debugPatterns.has('all')
            || this._debugPatterns.has(key)
            || -1 !== key.indexOf(this.debug)
        ){
            Logger.debug(type+' Event:', key);
        }
    }

}

module.exports = EventsManager;
