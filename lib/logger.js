/**
 *
 * Reldens - Logger
 *
 * This is a general logger handle.
 *
 */

class Logger
{

    constructor()
    {
        this.enableTrace = [];
    }

    info(...args)
    {
        // @TODO - BETA.17:
        //   - implement environment variables to validate the log level (info, warning, error, critical).
        //   - implement different log systems (console.log, files logs, db log?).
        //   - implement notifications system (email?), and make it configurable for the different log levels.
        console.info('INFO -', ...args);
        if(this.enableTrace.indexOf('info') !== -1){
            console.trace();
        }
    }

    error(...args)
    {
        console.error('ERROR -', ...args);
        if(this.enableTrace.indexOf('error') !== -1){
            console.trace();
        }
    }

}

module.exports = new Logger();
