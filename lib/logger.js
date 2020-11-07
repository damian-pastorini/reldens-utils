/**
 *
 * Reldens - Logger
 *
 * This is a general logger handle.
 *
 */

class Logger
{

    info(data)
    {
        // @TODO:
        //   - implement environment variables to validate the log level (info, warning, error, critical).
        //   - implement different log systems (console.log, files logs, db log?).
        //   - implement notifications system (email?), and make it configurable for the different log levels.
        console.log('INFO -', data);
    }

    error(data)
    {
        console.log('ERROR -', data);
    }

}

module.exports = new Logger();
