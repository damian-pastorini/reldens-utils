/**
 *
 * Reldens - EventsManager
 *
 * This will just export a single instance of the AwaitEventEmitter.
 *
 */

const AwaitEventEmitter = require('await-event-emitter');
const sc = require('./shortcuts');

class AwaitEventEmitterExtended extends AwaitEventEmitter
{

    constructor()
    {
        super();
        this.eventsByRemoveKeys = {};
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
        }
        // then delete the master key:
        delete this.eventsByRemoveKeys[masterKey];
    }

}

module.exports = AwaitEventEmitterExtended;
