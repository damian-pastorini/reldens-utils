/**
 *
 * Reldens - SchemaValidator
 *
 * This module is to validate the object properties at runtime.
 *
 */

const ValidatorInterface = require('./validator-interface');
const sc = require('./shortcuts');
const Logger = require('./logger');

class SchemaValidator extends ValidatorInterface
{

    constructor(schema)
    {
        super();
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
            if(validate.required && !sc.hasOwn(obj, i)){
                Logger.debug('Required property missing.', i);
                return false;
            }
            if(!sc.hasOwn(obj, i) && !validate.required){
                continue;
            }
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
        if(schema.custom && sc.isFunction(schema.custom)){
            if(!schema.custom(obj)){
                Logger.debug('Custom validation failed.', objectKey, obj, schema);
                return false;
            }
        }
        if(schema.enum && sc.isArray(schema.enum)){
            if(-1 === schema.enum.indexOf(obj)){
                Logger.debug('Value not in enum.', objectKey, obj, schema.enum);
                return false;
            }
        }
        switch(schema.type){
            case 'string':
                if(!sc.isString(obj)){
                    Logger.debug('Object is not a string.', objectKey, obj, schema);
                    return false;
                }
                if(schema.min && obj.length < schema.min){
                    Logger.debug('String too short.', objectKey, obj.length, schema.min);
                    return false;
                }
                if(schema.max && obj.length > schema.max){
                    Logger.debug('String too long.', objectKey, obj.length, schema.max);
                    return false;
                }
                if(schema.pattern && !schema.pattern.test(obj)){
                    Logger.debug('String pattern mismatch.', objectKey, obj, schema.pattern);
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
                if(schema.min && obj < schema.min){
                    Logger.debug('Number too small.', objectKey, obj, schema.min);
                    return false;
                }
                if(schema.max && obj > schema.max){
                    Logger.debug('Number too large.', objectKey, obj, schema.max);
                    return false;
                }
                break;
            case 'int':
                if(!sc.isInt(obj)){
                    Logger.debug('Object is not an integer.', objectKey, obj, schema);
                    return false;
                }
                if(schema.min && obj < schema.min){
                    Logger.debug('Integer too small.', objectKey, obj, schema.min);
                    return false;
                }
                if(schema.max && obj > schema.max){
                    Logger.debug('Integer too large.', objectKey, obj, schema.max);
                    return false;
                }
                break;
            case 'float':
                if(!sc.isFloat(obj)){
                    Logger.debug('Object is not a float.', objectKey, obj, schema);
                    return false;
                }
                if(schema.min && obj < schema.min){
                    Logger.debug('Float too small.', objectKey, obj, schema.min);
                    return false;
                }
                if(schema.max && obj > schema.max){
                    Logger.debug('Float too large.', objectKey, obj, schema.max);
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
                if(schema.min && obj.length < schema.min){
                    Logger.debug('Array too short.', objectKey, obj.length, schema.min);
                    return false;
                }
                if(schema.max && obj.length > schema.max){
                    Logger.debug('Array too long.', objectKey, obj.length, schema.max);
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
