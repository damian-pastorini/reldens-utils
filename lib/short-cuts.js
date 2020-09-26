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

}

module.exports = new ShortCuts();
