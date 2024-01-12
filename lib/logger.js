/**
 *
 * Reldens - Logger
 *
 */

class Logger
{

    logLevels = {
        none: 0,
        emergency: 1, // system is unusable
        alert: 2, // action must be taken immediately
        critical: 3, // critical conditions
        error: 4, // error conditions
        warning: 5, // warning conditions
        notice: 6, // normal but significant condition
        info: 7, // informational messages
        debug: 8 // debug-level messages
    };

    constructor()
    {
        // @TODO - BETA
        //   - Implement different log systems (console.log, files logs, db log?).
        //   - Implement notifications system (email?), and make it configurable for the different log levels.
        let context = this.context();
    }

    context()
    {
        // @NOTE: any change on this method could break Parcel and you will end up with the following error.
        // Failed to resolve module specifier "process"
        let context = process.env;
        if('undefined' !== typeof window){
            return window;
        }
        return context;
    }

    logLevel()
    {
        return this.context().RELDENS_LOG_LEVEL || 0;
    }

    enableTraceFor()
    {
        return (this.context().RELDENS_ENABLE_TRACE_FOR || '').split(',');
    }

    log(levelLabel, ...args)
    {
        console.log(levelLabel.toUpperCase()+' -', ...args);
        if(-1 !== this.enableTraceFor().indexOf('all') || -1 !== this.enableTraceFor().indexOf(levelLabel)){
            if('function' !== typeof Error?.captureStackTrace){
                console.log('Error.captureStackTrace is not available.', typeof Error?.captureStackTrace);
                return;
            }
            let stackHolder = {};
            Error.captureStackTrace(stackHolder, levelLabel);
            console.log(stackHolder.stack);
        }
    }

    debug(...args)
    {
        if(8 > this.logLevel()){
            return;
        }
        this.log('debug', ...args);
    }

    info(...args)
    {
        if(7 > this.logLevel()){
            return;
        }
        this.log('info', ...args);
    }

    notice(...args)
    {
        if(6 > this.logLevel()){
            return;
        }
        this.log('notice', ...args);
    }

    warning(...args)
    {
        if(5 > this.logLevel()){
            return;
        }
        this.log('warning', ...args);
    }

    error(...args)
    {
        if(4 > this.logLevel()){
            return;
        }
        this.log('error', ...args);
    }

    critical(...args)
    {
        if(3 > this.logLevel()){
            return;
        }
        this.log('critical', ...args);
    }

    alert(...args)
    {
        if(2 > this.logLevel()){
            return;
        }
        this.log('alert', ...args);
    }

    emergency(...args)
    {
        if(1 > this.logLevel()){
            return;
        }
        this.log('emergency', ...args);
    }

}

module.exports = new Logger();
