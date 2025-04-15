/**
 *
 * Reldens - Shortcuts
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
        return obj && {}.hasOwnProperty.call(obj, prop) && 'undefined' !== typeof obj[prop];
    }

    isTrue(obj, prop, strictValidation)
    {
        return (
            obj && {}.hasOwnProperty.call(obj, prop)
            && 'undefined' !== typeof obj[prop]
            && (strictValidation ? true === obj[prop] : obj[prop])
        );
    }

    isObject(obj)
    {
        return (obj && typeof obj === 'object' && !this.isArray(obj));
    }

    isArray(obj)
    {
        return Array.isArray(obj);
    }

    inArray(value, dataArray)
    {
        if(!this.isArray(dataArray)){
            return false;
        }
        return -1 !== dataArray.indexOf(value);
    }

    isFunction(callback)
    {
        return callback && 'function' === typeof callback;
    }

    isObjectFunction(obj, property)
    {
        return this.isObject(obj) && property && 'function' === typeof obj[property];
    }

    isString(value)
    {
        return 'string' === typeof value;
    }

    isNumber(value)
    {
        return 'number' === typeof value;
    }

    isInt(value)
    {
        if(!this.isNumber(value)){
            return false;
        }
        return Number.isInteger(value);
    }

    isFloat(value)
    {
        if(!this.isNumber(value)){
            return false;
        }
        return Number(value) === value && 0 !== value % 1;
    }

    isBoolean(value)
    {
        return 'boolean' === typeof value;
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

    startsWith(term, startWith)
    {
        return this.isString(term) && 0 === term.indexOf(startWith);
    }

    contains(term, needle)
    {
        return this.isString(term) && -1 !== term.indexOf(needle);
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
        return Object.keys(obj).sort((a, b) => {
            return (obj[a][sortField] > obj[b][sortField]) ? 1 : -1;
        });
    }

    arraySort(collection, sortField, direction = 'asc')
    {
        if(!collection){
            return collection;
        }
        if(!sortField){
            return collection;
        }
        let directionValue = 'act' === direction ? 1 : -1;
        let directionOpposite = 'act' === direction ? -1 : 1;
        return collection.sort((a, b) => {
            return a[sortField] > b[sortField] ? directionValue : directionOpposite;
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

    parseJson(jsonString, defaultReturn = false)
    {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return defaultReturn;
        }
    }

    deepJsonClone(obj)
    {
        return JSON.parse(this.toJsonString(obj));
    }

    toJsonString(obj)
    {
        return JSON.stringify(obj);
    }

    get(obj, prop, defaultReturn)
    {
        return this.hasOwn(obj, prop) ? obj[prop] : defaultReturn;
    }

    getByPath(obj, propertyPath, defaultReturn)
    {
        if(!this.isObject(obj) || !this.isArray(propertyPath)){
            return defaultReturn;
        }
        let property = propertyPath.shift();
        if(0 === propertyPath.length){
            return this.get(obj, property, defaultReturn);
        }
        return this.getByPath(obj[property], propertyPath, defaultReturn);
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

    fetchAllByProperty(itemsArray, propertyName, propertyValue)
    {
        if(!this.isArray(itemsArray)){
            return [];
        }
        if(0 === itemsArray.length){
            return [];
        }
        let foundItems = [];
        for(let item of itemsArray){
            if(item[propertyName] === propertyValue){
                foundItems.push(item);
            }
        }
        return foundItems;
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
            return [];
        }
        let objKeys = Object.keys(objectList);
        if(0 === objKeys.length){
            return [];
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
        return (new Date()).toISOString().slice(0, 19).replace('T', ' ');
    }

    getDateForFileName()
    {
        return (new Date()).toISOString().slice(0, 19).replace('T', '-').replace(/:/g, '-');
    }

    formatDate(date, format = 'Y-m-d H:i:s')
    {
        if(!(date instanceof Date)){
            return date;
        }
        let map = {
            Y: date.getFullYear(),
            m: (date.getMonth() + 1).toString().padStart(2, '0'),
            d: date.getDate().toString().padStart(2, '0'),
            H: date.getHours().toString().padStart(2, '0'),
            i: date.getMinutes().toString().padStart(2, '0'),
            s: date.getSeconds().toString().padStart(2, '0')
        };
        return format.replace(/Y|m|d|H|i|s/g, matched => map[matched]);
    }

    getTime()
    {
        return (new Date()).getTime();
    }

    roundToPrecision(number, precision = 4)
    {
        return Number(Number(number).toFixed(precision));
    }

    randomValueFromArray(array)
    {
        if(!this.isArray(array) || 0 === array.length){
            return null;
        }
        return array[Math.floor(Math.random() * array.length)];
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

    cleanMessage(message, characterLimit)
    {
        if(!message){
            return '';
        }
        let text = message.toString().replace(/\\/g, '');
        if(0 < characterLimit){
            return text.substring(0, characterLimit);
        }
        return text;
    }

    slugify(text)
    {
        return (text || '')
            .replace(/&/g, ' and ')
            .replace(/[^a-zA-Z0-9]/g, ' ')
            .trim()
            .replace(/\s+/g, '-')
            .toLowerCase();
    }

    isValidIsoCode(isoCode)
    {
        let isoLanguageCodeRegex = /^[a-zA-Z]{2}$/;
        return isoLanguageCodeRegex.test(isoCode);
    }

}

module.exports = new Shortcuts();
