/**
 *
 * Reldens - Logger
 *
 * This is a general logger handle.
 *
 */

class Logger
{
    logLevels = {
        none: 0,
        debug: 8, // debug-level messages
        info: 7, // informational messages
        notice: 6, // normal but significant condition
        warning: 5, // warning conditions
        error: 4, // error conditions
        critical: 3, // critical conditions
        alert: 2, // action must be taken immediately
        emergency: 1, // system is unusable
    };

    constructor()
    {
        // @TODO - BETA
        //   - Implement different log systems (console.log, files logs, db log?).
        //   - Implement notifications system (email?), and make it configurable for the different log levels.
        this.logLevel = process.env.RELDENS_LOG_LEVEL || 0;
        this.enableTraceFor = (process.env.RELDENS_ENABLE_TRACE_FOR || '').split(',');
    }

    log(levelLabel, ...args)
    {
        console.log(levelLabel.toUpperCase()+' -', ...args);
        if(this.enableTraceFor.indexOf(levelLabel) !== -1){
            console.trace();
        }
    }

    debug(...args)
    {
        if(8 > this.logLevel){
            return;
        }
        this.log('debug', ...args);
    }

    info(...args)
    {
        if(7 > this.logLevel){
            return;
        }
        this.log('info', ...args);
    }

    notice(...args)
    {
        if(6 > this.logLevel){
            return;
        }
        this.log('notice', ...args);
    }

    warning(...args)
    {
        if(5 > this.logLevel){
            return;
        }
        this.log('warning', ...args);
    }

    error(...args)
    {
        if(4 > this.logLevel){
            return;
        }
        this.log('error', ...args);
    }

    critical(...args)
    {
        if(3 > this.logLevel){
            return;
        }
        this.log('critical', ...args);
    }

    alert(...args)
    {
        if(2 > this.logLevel){
            return;
        }
        this.log('alert', ...args);
    }

    emergency(...args)
    {
        if(1 > this.logLevel){
            return;
        }
        this.log('emergency', ...args);
    }

}

module.exports = new Logger();
