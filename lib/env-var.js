/**
 *
 * Reldens - EnvVar
 *
 */

class EnvVar
{

    string(obj, key, defaultValue)
    {
        const val = obj[key];
        if('string' === typeof val){
            return val;
        }
        return defaultValue;
    }

    nonEmptyString(obj, key, defaultValue)
    {
        const val = obj[key];
        if('string' === typeof val && '' !== val.trim()){
            return val;
        }
        return defaultValue;
    }

    number(obj, key, defaultValue)
    {
        const val = obj[key];
        if(!isNaN(Number(val)) && '' !== val && null !== val){
            return Number(val);
        }
        return defaultValue;
    }

    boolean(obj, key, defaultValue)
    {
        const val = obj[key];
        if('true' === val || '1' === val){
            return true;
        }
        if('false' === val || '0' === val){
            return false;
        }
        return defaultValue;
    }

}

module.exports = new EnvVar();
