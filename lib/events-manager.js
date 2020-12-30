/**
 *
 * Reldens - EventsManager
 *
 * This extension includes a few new features:
 *
 * - The onWithKey and offWithKey methods will allow you to specify a "group" key for the event listener, the related
 * event will be referenced in a new property called "eventsByRemoveKey" so you can destroy multiple listeners at the
 * time.
 *
 * - Then the normal "on" and "off" aliases were override to include a debug check with a log. Using the debug property
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

    onWithKey(eventName, callback, removeKey, masterKey)
    {
        if(
            (masterKey && sc.hasOwn(this.eventsByRemoveKeys, masterKey) && sc.hasOwn(masterKey, removeKey))
            || sc.hasOwn(this.eventsByRemoveKeys, removeKey)
        ){
            // event exists, don't register twice:
            return false;
        }
        this.on(eventName, callback);
        let dataArr = this.listeners(eventName);
        let currentListener = dataArr[dataArr.length -1];
        if(masterKey){
            if(!sc.hasOwn(this.eventsByRemoveKeys, masterKey)){
                this.eventsByRemoveKeys[masterKey] = {};
            }
            this.eventsByRemoveKeys[masterKey][removeKey] = eventName;
        } else {
            this.eventsByRemoveKeys[removeKey] = eventName;
        }
        return currentListener;
    }

    /**
     * This method will remove a SINGLE event using the remove key. If the masterKey was specified, then this will look
     * into the masterKey property for the proper event name reference to remove it.
     */
    offWithKey(removeKey, masterKey)
    {
        if(
            (masterKey && !sc.hasOwn(this.eventsByRemoveKeys, masterKey))
            || !sc.hasOwn(this.eventsByRemoveKeys, removeKey)
        ){
            // event not found:
            return false;
        }
        let eventToRemove = masterKey ?
            this.eventsByRemoveKeys[masterKey][removeKey] : this.eventsByRemoveKeys[removeKey];
        (sc.hasOwn(this._events, eventToRemove) ? delete this._events[eventToRemove] : false);
        masterKey ? delete this.eventsByRemoveKeys[masterKey][removeKey] : delete this.eventsByRemoveKeys[removeKey];
    }

    /**
     * This method will remove ALL the events below the specified masterKey.
     */
    offByMasterKey(masterKey)
    {
        if(!sc.hasOwn(this.eventsByRemoveKeys, masterKey)){
            // master key not found:
            return false;
        }
        // loop all the events related to the masterKey and remove them one by one (because the _events is an object
        // with all the listeners attached).
        for(let removeKey of Object.keys(this.eventsByRemoveKeys[masterKey])){
            let eventToRemove = this.eventsByRemoveKeys[masterKey][removeKey];
            delete this._events[eventToRemove];
        }
        // then delete the master key:
        delete this.eventsByRemoveKeys[masterKey];
    }

    on(key, callback)
    {
        if(this.debug !== false){
            this.logDebugEvent(key, 'Listen');
        }
        super.on(key, callback);
    }

    async emit(key, ...args)
    {
        if(this.debug !== false){
            this.logDebugEvent(key, 'Fire');
        }
        await super.emit(key, ...args);
    }

    logDebugEvent(key, type)
    {
        if(
            this.debug.indexOf('all') !== -1
            || this.debug.indexOf(key) !== -1
            || key.indexOf(this.debug) !== -1
        ){
            Logger.info(type+' Event:', key);
        }
    }

}

module.exports = AwaitEventEmitterExtended;
