/**
 *
 * Reldens - EnvVar
 *
 */

const sc = require('./shortcuts');

class EnvVar
{

    string(obj, key, defaultValue)
    {
        let val = obj[key];
        if('string' === typeof val){
            return val;
        }
        return defaultValue;
    }

    nonEmptyString(obj, key, defaultValue)
    {
        let val = obj[key];
        if('string' === typeof val && '' !== val.trim()){
            return val;
        }
        return defaultValue;
    }

    number(obj, key, defaultValue)
    {
        let val = obj[key];
        let parsed = sc.parseNumber(val);
        if(parsed){
            return parsed;
        }
        return defaultValue;
    }

    boolean(obj, key, defaultValue)
    {
        let val = obj[key];
        if('true' === val || '1' === val){
            return true;
        }
        if('false' === val || '0' === val){
            return false;
        }
        return defaultValue;
    }

    array(obj, key, defaultValue, separator = ',')
    {
        let val = obj[key];
        let parsed = sc.splitToArray(val, separator);
        if(parsed){
            return parsed;
        }
        return defaultValue;
    }

    url(obj, key, defaultValue)
    {
        let val = obj[key];
        if(!sc.isString(val)){
            return defaultValue;
        }
        if(sc.isValidUrl(val)){
            return val;
        }
        return defaultValue;
    }

    json(obj, key, defaultValue)
    {
        let val = obj[key];
        if(!sc.isString(val)){
            return defaultValue;
        }
        return sc.parseJson(val, defaultValue);
    }

    integer(obj, key, defaultValue, min, max)
    {
        let val = this.number(obj, key, defaultValue);
        if(val !== defaultValue && sc.isValidInteger(val, min, max)){
            return val;
        }
        return defaultValue;
    }

    port(obj, key, defaultValue)
    {
        return this.integer(obj, key, defaultValue, 1, 65535);
    }

}

module.exports = new EnvVar();
