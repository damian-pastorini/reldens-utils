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

    isObject(obj)
    {
        return (obj && typeof obj === 'object' && !this.isArray(obj));
    }

    isArray(obj)
    {
        return Array.isArray(obj);
    }

    isFunction(obj, property)
    {
        return 'function' === typeof obj[property];
    }

    deepMergeProperties(target, source)
    {
        if(!this.isObject(target) || !this.isObject(source)){
            return false;
        }
        for(let key of Object.keys(source)){
            if(this.isObject(source[key])){
                if(!this.hasOwn(target, key)){
                    target[key] = source[key];
                    continue;
                }
                this.deepMergeProperties(target[key], source[key]);
                continue;
            }
            target[key] = source[key];
        }
        return target;
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

    sortObjectKeysBy(obj, sortField)
    {
        return Object.keys(obj).sort((a,b) => {
            return (obj[a][sortField] > obj[b][sortField]) ? 1 : -1;
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

    get(obj, prop, defaultReturn)
    {
        return this.hasOwn(obj, prop) ? obj[prop] : defaultReturn;
    }

    getByPriority(obj, propsArray)
    {
        if(!this.isArray(propsArray)){
            return false;
        }
        for(let prop of propsArray){
            if(this.hasOwn(obj, prop)){
                return obj[prop];
            }
        }
        return false;
    }

    fetchByProperty(itemsArray, propertyName, propertyValue)
    {
        if(!this.isArray(itemsArray)){
            return false;
        }
        if(0 === itemsArray.length){
            return false;
        }
        for(let item of itemsArray){
            if(item[propertyName] === propertyValue){
                return item;
            }
        }
        return false;
    }

    fetchByPropertyOnObject(objectList, propertyName, propertyValue)
    {
        if(!objectList){
            return false;
        }
        let objKeys = Object.keys(objectList);
        if(0 === objKeys.length){
            return false;
        }
        for(let i of objKeys){
            let obj = objectList[i];
            if(obj[propertyName] === propertyValue){
                return obj;
            }
        }
        return false;
    }

    fetchAllByPropertyOnObject(objectList, propertyName, propertyValue)
    {
        if(!objectList){
            return false;
        }
        let objKeys = Object.keys(objectList);
        if(0 === objKeys.length){
            return false;
        }
        let results = [];
        for(let i of objKeys){
            let obj = objectList[i];
            if(obj[propertyName] === propertyValue){
                results.push(obj);
            }
        }
        return results;
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

    randomInteger(min, max)
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomChars(length)
    {
        if(0 >= length){
            return '';
        }
        return this.randomString(length, false);
    }

    randomCharsWithSymbols(length)
    {
        if(0 >= length){
            return '';
        }
        return this.randomString(length, true);
    }

    randomString(length, withSymbols = false)
    {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        if(withSymbols){
            characters += '!@#$%&*()_-=+[]{}:;<>,./?';
        }
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    numberWithDecimals(number, decimals = 0)
    {
        return Number(Number(number).toFixed(decimals));
    }
}

module.exports = new Shortcuts();
