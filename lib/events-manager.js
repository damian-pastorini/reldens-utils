/**
 *
 * Reldens - EventsManager
 *
 * This extension includes a few new features:
 *
 * - The onWithKey and offWithKey methods will allow you to specify a "group" key for the event listener, the related
 * event will be referenced in a new property called "eventsByRemoveKey" so you can detach multiple listeners at the
 * time.
 *
 * - We override the "on" and "off" aliases override to include a debug check with a log. Using the debug property,
 * you can specify to log "all" the fire and listeners, or just by key. Note the key search will be applied in both
 * directions, it will check if the debug value exists in the event key or if the event key exists in the debug value.
 *
 */

const AwaitEventEmitter = require('await-event-emitter').default;
const Logger = require('./logger');
const sc = require('./shortcuts');

class AwaitEventEmitterExtended extends AwaitEventEmitter
{

    constructor()
    {
        super();
        this.eventsByRemoveKeys = {};
        this.debug = false;
    }

    validateEventKey(eventKey)
    {
        return !sc.hasDangerousKeys(null, eventKey);
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

    on(key, callback)
    {
        if(!this.validateEventKey(key)){
            Logger.critical('Invalid event key detected: '+key);
            return false;
        }
        if(false !== this.debug){
            this.logDebugEvent(key, 'Listen');
        }
        super.on(key, callback);
    }

    async emit(key, ...args)
    {
        if(!this.validateEventKey(key)){
            Logger.critical('Invalid event key detected: '+key);
            return false;
        }
        if(false !== this.debug){
            this.logDebugEvent(key, 'Fire');
        }
        await super.emit(key, ...args);
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

module.exports = AwaitEventEmitterExtended;
