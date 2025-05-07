/**
 *
 * Reldens - ErrorManager
 *
 */

class ErrorManager
{

    constructor()
    {
        this.enableTrace = false;
        this.callback = false;
    }

    error(message)
    {
        if(this.enableTrace){
            console.trace();
        }
        if('function' === typeof this.callback){
            // use the callback to implement any customization here:
            return this.callback(message);
        }
        throw new Error(message);
    }

}

module.exports = new ErrorManager();
