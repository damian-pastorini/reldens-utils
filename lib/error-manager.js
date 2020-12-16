/**
 *
 * Reldens - ErrorManager
 *
 * This module handle all the game errors.
 *
 */

class ErrorManager
{

    constructor()
    {
        this.enableTrace = false;
    }

    error(message)
    {
        // @TODO - BETA.17: evaluate better ways to handle errors, implement email notifications, etc.
        if(this.enableTrace){
            console.trace();
        }
        throw new Error(message);
    }

}

module.exports = new ErrorManager();
