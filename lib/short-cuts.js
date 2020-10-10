/**
 *
 * Reldens - ShortCuts
 *
 * Shortcuts collection.
 *
 */

class ShortCuts
{

    hasOwn(obj, prop)
    {
        return {}.hasOwnProperty.call(obj, prop);
    }

    isTrue(obj, prop)
    {
        return ({}.hasOwnProperty.call(obj, prop) && obj[prop]);
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

}

module.exports = new ShortCuts();
