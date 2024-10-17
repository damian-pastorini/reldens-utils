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
        this.enableTraceBack = '';
        this.logLevelBack = 3;
        this.forcedDisabled = Boolean(context.RELDENS_FORCED_DISABLED_LOGS || false);
        this.addTimeStamp = Boolean(context.RELDENS_INCLUDE_LOGS_TIMESTAMP || true);
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

    enableTraceAll()
    {
        this.enableTraceBack = this.context().RELDENS_ENABLE_TRACE_FOR;
        this.context().RELDENS_ENABLE_TRACE_FOR = 'all';
        return this;
    }

    restoreTraceFor()
    {
        this.context().RELDENS_ENABLE_TRACE_FOR = this.enableTraceBack;
        return this;
    }

    setLogLevel(level)
    {
        this.logLevelBack = this.context().RELDENS_LOG_LEVEL;
        this.context().RELDENS_LOG_LEVEL = level;
        return this;
    }

    restoreLogLevel()
    {
        this.context().RELDENS_LOG_LEVEL = this.logLevelBack;
        return this;
    }

    setForcedDisabled(forced)
    {
        this.forcedDisabled = forced;
        return this;
    }

    setAddTimeStamp(addTimeStamp)
    {
        this.addTimeStamp = addTimeStamp;
        return this;
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
        let date = !this.addTimeStamp ? '' : (new Date()).toISOString().slice(0, 19).replace('T', ' ')+' - ';
        console.log(date+levelLabel.toUpperCase()+' -', ...args);
        if(-1 !== this.enableTraceFor().indexOf('all') || -1 !== this.enableTraceFor().indexOf(levelLabel)){
            if('function' !== typeof Error?.captureStackTrace){
                console.log('Error.captureStackTrace is not available.', typeof Error?.captureStackTrace);
                return this;
            }
            let stackHolder = {};
            Error.captureStackTrace(stackHolder, levelLabel);
            console.log(stackHolder.stack);
        }
        return this;
    }

    debug(...args)
    {
        if(this.forcedDisabled){
            return this;
        }
        if(8 > this.logLevel()){
            return this;
        }
        return this.log('debug', ...args);
    }

    info(...args)
    {
        if(this.forcedDisabled){
            return this;
        }
        if(7 > this.logLevel()){
            return this;
        }
        return this.log('info', ...args);
    }

    notice(...args)
    {
        if(this.forcedDisabled){
            return this;
        }
        if(6 > this.logLevel()){
            return this;
        }
        return this.log('notice', ...args);
    }

    warning(...args)
    {
        if(this.forcedDisabled){
            return this;
        }
        if(5 > this.logLevel()){
            return this;
        }
        return this.log('warning', ...args);
    }

    error(...args)
    {
        if(this.forcedDisabled){
            return this;
        }
        if(4 > this.logLevel()){
            return this;
        }
        return this.log('error', ...args);
    }

    critical(...args)
    {
        if(this.forcedDisabled){
            return this;
        }
        if(3 > this.logLevel()){
            return this;
        }
        return this.log('critical', ...args);
    }

    alert(...args)
    {
        if(this.forcedDisabled){
            return this;
        }
        if(2 > this.logLevel()){
            return this;
        }
        return this.log('alert', ...args);
    }

    emergency(...args)
    {
        if(this.forcedDisabled){
            return this;
        }
        if(1 > this.logLevel()){
            return this;
        }
        return this.log('emergency', ...args);
    }

}

module.exports = new Logger();
