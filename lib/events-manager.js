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
        this.TYPE_KEY_NAME = 'symbol' === typeof Symbol
            ? Symbol.for('--[[await-event-emitter]]--')
            : '--[[await-event-emitter]]--';
    }

    assertType(type)
    {
        if('string' !== typeof type && 'symbol' !== typeof type){
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
            [this.TYPE_KEY_NAME]: 'always',
            fn
        };
    }

    onceListener(fn)
    {
        return {
            [this.TYPE_KEY_NAME]: 'once',
            fn
        };
    }

    validateEventKey(eventKey)
    {
        return !sc.hasDangerousKeys(null, eventKey);
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
        return this;
    }

    listeners(type)
    {
        return (this._events[type] || []).map((x) => x.fn);
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
        return this;
    }

    removeAllListeners()
    {
        this._events = {};
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
        if('function' === typeof nullOrFn){
            let index = -1;
            let found = false;
            while(-1 < (index = listeners.indexOf(nullOrFn))){
                listeners.splice(index, 1);
                this._events[type].splice(index, 1);
                found = true;
            }
            return found;
        }
        return delete this._events[type];
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
                if(this._events[type] && this._events[type][i] && 'once' === this._events[type][i][this.TYPE_KEY_NAME]){
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
                if(this._events[type] && this._events[type][i] && 'once' === this._events[type][i][this.TYPE_KEY_NAME]){
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
        for(let uniqueRemoveKey of Object.keys(this.eventsByRemoveKeys[masterKey])){
            let eventToRemove = this.eventsByRemoveKeys[masterKey][uniqueRemoveKey];
            if(!this.validateEventKey(eventToRemove.eventName)){
                continue;
            }
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
        delete this.eventsByRemoveKeys[masterKey];
    }

    logDebugEvent(key, type)
    {
        if(
            -1 !== this.debug.indexOf('all')
            || -1 !== this.debug.indexOf(key)
            || -1 !== key.indexOf(this.debug)
        ){
            Logger.debug(type+' Event:', key);
        }
    }

}

module.exports = EventsManager;
