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
        if(this.isArray(prop)){
            for(let value of prop){
                if(!(obj && {}.hasOwnProperty.call(obj, value))){
                    return false;
                }
            }
            return true;
        } else {
            return (obj && {}.hasOwnProperty.call(obj, prop));
        }
    }

    isTrue(obj, prop)
    {
        return (obj && {}.hasOwnProperty.call(obj, prop) && obj[prop]);
    }

    isArray(obj)
    {
        return Array.isArray(obj);
    }

    sortObjectKeysBy(object, sortField)
    {
        return Object.keys(object).sort((a,b) => {
            return (object[a][sortField] > object[b][sortField]) ? 1 : -1;
        });
    }

    propsAssign(from, to, props)
    {
        for(let i of props){
            to[i] = from[i];
        }
        return to;
    }

    getJson(jsonString, defaultReturn = false)
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

    getDef(object, prop, defaultReturn)
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

}

module.exports = new Shortcuts();
