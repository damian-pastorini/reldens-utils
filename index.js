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
    PageRangeProvider: require('./lib/page-range-provider'),
    ValidatorInterface: require('./lib/validator-interface'),
    SchemaValidator: require('./lib/schema-validator'),
    EnvVar: require('./lib/env-var'),
    Logger: require('./lib/logger'),
    sc: require('./lib/shortcuts')
};
