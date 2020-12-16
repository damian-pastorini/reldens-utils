/**
 *
 * Reldens - EventsManager
 *
 * This will just export a single instance of the AwaitEventEmitter.
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
            this.eventsByRemoveKeys[masterKey][removeKey] = {
                eventName,
                listener: currentListener
            };
        } else {
            this.eventsByRemoveKeys[removeKey] = {
                eventName,
                listener: currentListener
            };
        }
        return currentListener;
    }

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
        this.off(eventToRemove.eventName, eventToRemove.listener);
        (this._events[eventToRemove.eventName].length <= 0 ? delete this._events[eventToRemove.eventName] : false);
        masterKey ? delete this.eventsByRemoveKeys[masterKey][removeKey] : delete this.eventsByRemoveKeys[removeKey];
    }

    offByMasterKey(masterKey)
    {
        if(!sc.hasOwn(this.eventsByRemoveKeys, masterKey)){
            // master key not found:
            return false;
        }
        for(let removeKey of Object.keys(this.eventsByRemoveKeys[masterKey])){
            let eventToRemove = this.eventsByRemoveKeys[masterKey][removeKey];
            // turn off each event:
            this.off(eventToRemove.eventName, eventToRemove.listener);
            (this._events[eventToRemove.eventName].length <= 0 ? delete this._events[eventToRemove.eventName] : false);
        }
        // then delete the master key:
        delete this.eventsByRemoveKeys[masterKey];
    }

    on(key, callback)
    {
        if(
            this.debug !== false && (
                this.debug.indexOf('all') !== -1
                || this.debug.indexOf(key) !== -1
                || key.indexOf(this.debug) !== -1
            )
        ){
            Logger.info('Listen Event:', key);
        }
        super.on(key, callback);
    }

    async emit(key, ...args)
    {
        if(
            this.debug !== false && (
                this.debug.indexOf('all') !== -1
                || this.debug.indexOf(key) !== -1
                || key.indexOf(this.debug) !== -1
            )
        ){
            Logger.info('Fire Event:', key);
        }
        await super.emit(key, ...args);
    }

}

module.exports = AwaitEventEmitterExtended;
