/**
 *
 * Reldens - Logger
 *
 */

const sc = require('./shortcuts');

class Logger
{

    logLevels = {
        none: 0,
        emergency: 1, // the system is unusable
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
        let context = this.context();
        this.enableTraceBack = sc.get(context, 'RELDENS_LOGS_ENABLE_TRACE_BACK', '');
        this.logLevelBack = sc.get(context, 'RELDENS_LOGS_LEVEL_BACK', 3);
        this.callback = false;
        this.forcedDisabled = Boolean(sc.get(context, 'RELDENS_LOGS_FORCED_DISABLED', false));
        this.addTimeStamp = Boolean(sc.get(context, 'RELDENS_LOGS_INCLUDE_TIMESTAMP', true));
        this.maxLogArgLength = sc.get(context, 'RELDENS_LOGS_MAX_ARGUMENT_LENGTH', 0);
        this.maxStackTraceLength = sc.get(context, 'RELDENS_LOGS_MAX_STACK_TRACE_LENGTH', 0);
        this.applySanitizer = Boolean(sc.get(context, 'RELDENS_LOGS_APPLY_SANITIZER', false));
        this.activeLogLevels = [];
        this.customLevels = [];
    }

    context()
    {
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

    log(levelNumber, levelLabel, ...args)
    {
        if(this.forcedDisabled){
            return this;
        }
        if(0 < this.activeLogLevels.length){
            if(-1 === this.activeLogLevels.indexOf(levelNumber)){
                return this;
            }
        }
        if(0 === this.activeLogLevels.length){
            if(levelNumber > this.logLevel()){
                return this;
            }
        }
        let date = !this.addTimeStamp ? '' : (new Date()).toISOString().slice(0, 19).replace('T', ' ')+' - ';
        let processedArgs = args;
        if(this.applySanitizer){
            processedArgs = args.map(arg => sc.isString(arg) ? sc.cleanMessage(arg, this.maxLogArgLength) : arg);
        }
        this.logWithCallback(date+levelLabel.toUpperCase()+' -', ...processedArgs);
        if(-1 !== this.enableTraceFor().indexOf('all') || -1 !== this.enableTraceFor().indexOf(levelLabel)){
            if('function' !== typeof Error?.captureStackTrace){
                this.logWithCallback('Error.captureStackTrace is not available.', typeof Error?.captureStackTrace);
                return this;
            }
            let stackHolder = {};
            Error.captureStackTrace(stackHolder, levelLabel);
            let processedStack = stackHolder.stack;
            if(this.applySanitizer){
                processedStack = sc.cleanMessage(stackHolder.stack, this.maxStackTraceLength);
            }
            this.logWithCallback(processedStack);
        }
        return this;
    }

    logWithCallback(...args)
    {
        if('function' === typeof this.callback){
            this.callback(...args);
        }
        console.log(...args);
    }

    debug(...args)
    {
        return this.log(8, 'debug', ...args);
    }

    info(...args)
    {
        return this.log(7, 'info', ...args);
    }

    notice(...args)
    {
        return this.log(6, 'notice', ...args);
    }

    warning(...args)
    {
        return this.log(5, 'warning', ...args);
    }

    error(...args)
    {
        return this.log(4, 'error', ...args);
    }

    critical(...args)
    {
        return this.log(3, 'critical', ...args);
    }

    alert(...args)
    {
        return this.log(2, 'alert', ...args);
    }

    emergency(...args)
    {
        return this.log(1, 'emergency', ...args);
    }

}

module.exports = new Logger();
