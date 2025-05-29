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

    isNotEmptyArray(dataArray)
    {
        return (this.isArray(dataArray) && 0 < dataArray.length);
    }

    isFunction(callback)
    {
        return (callback && 'function' === typeof callback);
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

    hasDangerousKeys(obj, key = null)
    {
        let dangerousKeys = ['__proto__', 'constructor', 'prototype'];
        if(key){
            return -1 !== dangerousKeys.indexOf(key);
        }
        if(!this.isObject(obj)){
            return false;
        }
        for(let dangerousKey of dangerousKeys){
            if(this.hasOwn(obj, dangerousKey)){
                return true;
            }
        }
        return false;
    }

    deepMergeProperties(target, source)
    {
        if(!this.isObject(target) || !this.isObject(source)){
            return false;
        }
        for(let key of Object.keys(source)){
            if(this.hasDangerousKeys(null, key)){
                continue;
            }
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
        let directionValue = 'asc' === direction ? 1 : -1;
        let directionOpposite = 'asc' === direction ? -1 : 1;
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
        let parsed;
        try {
            parsed = JSON.parse(jsonString);
        } catch (e) {
            return defaultReturn;
        }
        if(this.hasDangerousKeys(parsed)){
            return defaultReturn;
        }
        return parsed;
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
                if(!this.isArray(obj[key])){
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
            return -1 === removeValues.indexOf(value);
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
        let text = message.replace(/\\/g, '').replace(/[\r\n\t]/g, ' ');
        if(0 < characterLimit){
            return text.substring(0, characterLimit);
        }
        return text;
    }

    slugify(text)
    {
        return (text || '').replace(/&/g, ' and ')
            .replace(/[^a-zA-Z0-9]/g, ' ')
            .trim()
            .replace(/\s+/g, '-')
            .toLowerCase();
    }

    isValidIsoCode(isoCode)
    {
        return (/^[a-zA-Z]{2}$/).test(isoCode);
    }

    sanitize(input)
    {
        if(!input){
            return '';
        }
        return input.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .replace(/`/g, '&#x60;')
            .replace(/\(/g, '&#x28;')
            .replace(/\)/g, '&#x29;');
    }

    sanitizeUrl(url)
    {
        if(!url || !this.isString(url) || 2048 < url.length){
            return '';
        }
        let sanitized = url.trim();
        let urlPattern = /^https?:\/\/(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(?::[1-9][0-9]{0,4})?(?:\/(?:[\w\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*(?:\?(?:[\w\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?(?:#(?:[\w\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?$/;
        if(!urlPattern.test(sanitized)){
            return '';
        }
        return sanitized.replace(/javascript:/gi, '')
            .replace(/data:/gi, '')
            .replace(/vbscript:/gi, '');
    }

    camelCase(str)
    {
        if(!this.isString(str) || 0 === str.length){
            return str;
        }
        return str.replace(/[_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
    }

    capitalizedCamelCase(str)
    {
        if(!this.isString(str) || 0 === str.length){
            return str;
        }
        let camelStr = this.camelCase(str);
        return camelStr.charAt(0).toUpperCase() + camelStr.slice(1);
    }

    kebabCase(str)
    {
        return str.replace(/[_\s]+/g, '-');
    }

    capitalize(str)
    {
        if(!this.isString(str) || 0 === str.length){
            return str;
        }
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    chunk(array, size)
    {
        if(!this.isArray(array) || 0 >= size){
            return [];
        }
        let result = [];
        for(let i = 0; i < array.length; i += size){
            result.push(array.slice(i, i + size));
        }
        return result;
    }

    flatten(array, depth = 1)
    {
        if(!this.isArray(array)){
            return [];
        }
        return array.flat(depth);
    }

    unique(array)
    {
        if(!this.isArray(array)){
            return [];
        }
        return [...new Set(array)];
    }

    clamp(value, min, max)
    {
        if(!this.isNumber(value) || !this.isNumber(min) || !this.isNumber(max)){
            return value;
        }
        return Math.min(Math.max(value, min), max);
    }

    truncate(str, length, suffix = '...')
    {
        if(!this.isString(str) || str.length <= length){
            return str;
        }
        return str.substring(0, length) + suffix;
    }

    pickProps(obj, props)
    {
        if(!this.isObject(obj) || !this.isArray(props)){
            return {};
        }
        let result = {};
        for(let prop of props){
            if(this.hasDangerousKeys(null, prop)){
                continue;
            }
            if(this.hasOwn(obj, prop)){
                result[prop] = obj[prop];
            }
        }
        return result;
    }

    omitProps(obj, props)
    {
        if(!this.isObject(obj) || !this.isArray(props)){
            return obj;
        }
        let result = {};
        for(let key of Object.keys(obj)){
            if(-1 === props.indexOf(key)){
                result[key] = obj[key];
            }
        }
        return result;
    }

    debounce(func, wait)
    {
        if(!this.isFunction(func) || !this.isNumber(wait)){
            return func;
        }
        let timeout;
        return function executedFunction(...args) {
            let later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit)
    {
        if(!this.isFunction(func) || !this.isNumber(limit)){
            return func;
        }
        let inThrottle;
        return function executedFunction(...args) {
            if(!inThrottle){
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    isValidUrl(url)
    {
        if(!this.isString(url) || 2048 < url.length){
            return false;
        }
        let urlPattern = /^https?:\/\/(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(?::[1-9][0-9]{0,4})?(?:\/(?:[\w\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*(?:\?(?:[\w\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?(?:#(?:[\w\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?$/;
        return urlPattern.test(url);
    }

    isValidInteger(value, min, max)
    {
        if(!this.isNumber(value) || !Number.isInteger(value)){
            return false;
        }
        if('number' === typeof min && value < min){
            return false;
        }
        if('number' === typeof max && value > max){
            return false;
        }
        return true;
    }

    parseNumber(value)
    {
        if(!isNaN(Number(value)) && '' !== value && null !== value){
            return Number(value);
        }
        return null;
    }

    splitToArray(str, separator = ',')
    {
        if(!this.isString(str) || '' === str.trim()){
            return null;
        }
        return str.split(separator).map(item => item.trim()).filter(item => '' !== item);
    }

}

module.exports = new Shortcuts();
