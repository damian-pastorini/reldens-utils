/**
 *
 * Reldens - Utils
 *
 */

const EventsManager = require('./lib/events-manager');

module.exports = {
    EventsManager,
    EventsManagerSingleton: new EventsManager(),
    ErrorManager: require('./lib/error-manager'),
    InteractionArea: require('./lib/interaction-area'),
    Logger: require('./lib/logger'),
    sc: require('./lib/shortcuts')
};
