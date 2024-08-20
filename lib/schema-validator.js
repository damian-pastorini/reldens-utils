/**
 *
 * Reldens - SchemaValidator
 *
 * This module is to validate objects properties at runtime.
 *
 */

const sc = require('./shortcuts');
const Logger = require('./logger');

class SchemaValidator
{

    constructor(schema)
    {
        this.schema = schema;
    }

    /**
     * Sample schema:
     * {
     *     prop: {type: 'string', min: 1},
     *     prop2: {type: 'object', nested: {
     *         anotherProp: {type: 'int', float: 1}
     *     }}
     * }
     *
     * @param obj
     * @param schema
     * @returns {boolean}
     */
    validate(obj, schema = false)
    {
        if(!schema){
            schema = this.schema;
        }
        if (!sc.isObject(schema)){
            Logger.debug('No schema provided.');
            return false;
        }
        for(let i of Object.keys(schema)){
            let validate = schema[i];
            if(!this.isValidSchema(obj[i], validate, i)){
                return false;
            }
            if(validate.nested){
                if(!this.validate(obj[i], validate.nested)){
                    return false;
                }
            }
        }
        return true;
    }

    isValidSchema(obj, schema, objectKey)
    {
        if(!schema ||!schema.type){
            Logger.debug('No schema type provided.', schema, obj, objectKey);
            return false;
        }
        switch(schema.type){
            case 'string':
                if(!sc.isString(obj)){
                    Logger.debug('Object is not a string.', objectKey, obj, schema);
                    return false;
                }
                break;
            case 'number':
                if(!sc.isInt(obj)){
                    if(!sc.isFloat(obj)){
                        Logger.debug('Object is not a number.', objectKey, obj, schema);
                        return false;
                    }
                }
                break;
            case 'int':
                if(!sc.isInt(obj)){
                    Logger.debug('Object is not an integer.', objectKey, obj, schema);
                    return false;
                }
                break;
            case 'float':
                if(!sc.isFloat(obj)){
                    Logger.debug('Object is not a float.', objectKey, obj, schema);
                    return false;
                }
                break;
            case 'boolean':
                if(!sc.isBoolean(obj)){
                    Logger.debug('Object is not a boolean.', objectKey, obj, schema);
                    return false;
                }
                break;
            case 'object':
                if(!sc.isObject(obj)){
                    Logger.debug('Object is not an object.', objectKey, obj, schema);
                    return false;
                }
                break;
            case 'array':
                if(!sc.isArray(obj)){
                    Logger.debug('Object is not an array.', objectKey, obj, schema);
                    return false;
                }
                if(schema.valuesType){
                    for(let i of obj){
                        if(!this.isValidSchema(i, {type: schema.valuesType}, objectKey)){
                            Logger.debug('Invalid array value.', i, schema);
                            return false;
                        }
                    }
                }
                break;
            default:
                Logger.debug('Invalid schema type provided.', schema.type);
                return false;
        }
        return true;
    }

}

module.exports = SchemaValidator;
