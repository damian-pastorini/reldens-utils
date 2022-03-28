/**
 *
 * Reldens - Shortcuts
 *
 * Shortcuts collection.
 *
 */

class Shortcuts
{

    hasOwn(obj, prop)
    {
        if(this.isArray(prop) && 0 < prop.length){
            for(let value of prop){
                if(!(obj && {}.hasOwnProperty.call(obj, value))){
                    return false;
                }
            }
            return true;
        }
        return (obj && {}.hasOwnProperty.call(obj, prop));
    }

    isTrue(obj, prop, strictValidation)
    {
        return (obj && {}.hasOwnProperty.call(obj, prop) && (strictValidation ? true === obj[prop] : obj[prop]));
    }

    isArray(obj)
    {
        return Array.isArray(obj);
    }

    length(obj)
    {
        if(!obj){
            return 0;
        }
        return Object.keys(obj).length;
    }

    convertObjectsArrayToObjectByKeys(dataArray, keyProperty)
    {
        if(!this.isArray(dataArray) || 0 === dataArray.length){
            return {};
        }
        let objectByKeys = {};
        for(let arrayItem of dataArray){
            objectByKeys[arrayItem[keyProperty]] = arrayItem;
        }
        return objectByKeys;
    }

    sortObjectKeysBy(object, sortField)
    {
        return Object.keys(object).sort((a,b) => {
            return (object[a][sortField] > object[b][sortField]) ? 1 : -1;
        });
    }

    propsAssign(from, to, props)
    {
        if(!this.isArray(props)){
            return to;
        }
        for(let i of props){
            to[i] = from[i];
        }
        return to;
    }

    toJson(jsonString, defaultReturn = false)
    {
        return this.parseJson(jsonString) || defaultReturn;
    }

    parseJson(jsonString)
    {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return false;
        }
    }

    get(object, prop, defaultReturn)
    {
        return this.hasOwn(object, prop) ? object[prop] : defaultReturn;
    }

    getByPriority(object, propsArray)
    {
        if(!this.isArray(propsArray)){
            return false;
        }
        for(let prop of propsArray){
            if(this.hasOwn(object, prop)){
                return object[prop];
            }
        }
        return false;
    }

    serializeFormData(formData)
    {
        if(0 === formData.length){
            return {};
        }
        let obj = {};
        for(let [key, value] of formData){
            if(obj[key] !== undefined){
                if(!Array.isArray(obj[key])){
                    obj[key] = [obj[key]];
                }
                obj[key].push(value);
            } else {
                obj[key] = value;
            }
        }
        return obj;
    }

    removeFromArray(valuesArray, removeValues)
    {
        return valuesArray.filter((value) => {
            return removeValues.indexOf(value) === -1;
        });
    }

    getCurrentDate()
    {
        // get date:
        let date = new Date();
        // format:
        return date.toISOString().slice(0, 19).replace('T', ' ');
    }

}

module.exports = new Shortcuts();
