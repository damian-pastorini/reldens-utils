[![Reldens - GitHub - Release](https://www.dwdeveloper.com/media/reldens/reldens-mmorpg-platform.png)](https://github.com/damian-pastorini/reldens)

# Reldens - Utils

## Features

- Interaction area calculation helper.
- Page range provider helper.
- A validator interface and the SchemaValidator.
- EnvVar for cast variables.
- Shortcuts.
- Logger.
- Error Manager.
- Events Manager and Events Manager Singleton.

---

## Usage examples

### EventsManager
Advanced event emitter with features like event sanitization, memory leak detection, key-based event management, and support for async/sync execution.

```javascript
const { EventsManager } = require('@reldens/utils');
let eventsManager = new EventsManager();

// Listen to events
eventsManager.on('userLogin', (userData) => {
    console.log('User logged in:', userData.username);
});

// Emit events
eventsManager.emit('userLogin', { username: 'player1', id: 123 });

// Listen with unique keys
eventsManager.onWithKey('gameStart', callback, 'uniqueKey');
eventsManager.offWithKey('uniqueKey'); // Remove by key
```

### InteractionArea
Spatial interaction validation helper that determines if objects are within interaction range based on coordinates and area margins.

```javascript
const { InteractionArea } = require('@reldens/utils');
let interactionArea = new InteractionArea();

// Setup interaction area
interactionArea.setupInteractionArea(50, 100, 200); // margin=50, x=100, y=200

// Validate interaction
let isValid = interactionArea.isValidInteraction(120, 210); // true
let isInvalid = interactionArea.isValidInteraction(200, 300); // false
```

### Logger
Advanced logging utility with multiple log levels, custom levels support, active level filtering, and environment-based configuration.

```javascript
const { Logger } = require('@reldens/utils');

// Standard logging
Logger.info('Application started');
Logger.error('Database connection failed', errorDetails);
Logger.debug('Processing user request', requestData);

// Custom levels
Logger.activeLogLevels = [3, 4, 10]; // Only critical, error, and custom level 10
Logger.customLevels = [10, 11, 12];
Logger.log(10, 'custom', 'Custom log message');

// Configuration
Logger.setForcedDisabled(false);
Logger.setAddTimeStamp(true);
```

### PageRangeProvider
Pagination helper that calculates page ranges for UI components, handling first/last page navigation and customizable display options.

```javascript
const { PageRangeProvider } = require('@reldens/utils');

// Generate page range (it's a singleton, use directly)
let range = PageRangeProvider.fetch(5, 20, 7, 'First', 'Last');
// Returns: [{label: 'First', value: 1}, {label: 2, value: 2}, ...]

// Simple range
let simpleRange = PageRangeProvider.fetch(3, 10, 5);
// Returns pages around current page 3
```

### SchemaValidator
Object validation utility that validates object properties against defined schemas with support for nested objects and custom validation rules.

```javascript
const { SchemaValidator } = require('@reldens/utils');

let schema = {
    username: { type: 'string', min: 3, max: 20 },
    age: { type: 'int', min: 18 },
    profile: {
        type: 'object',
        nested: {
            email: { type: 'string', required: true }
        }
    }
};

let validator = new SchemaValidator(schema);
let userData = { username: 'player1', age: 25, profile: { email: 'test@example.com' } };
let isValid = validator.validate(userData);
```

### Shortcuts (sc)
Core utility class providing essential object manipulation, property access, and validation methods used throughout Reldens.

```javascript
const { sc } = require('@reldens/utils');

// Safe property access
let value = sc.get(obj, 'nested.property.path', 'defaultValue');

// Check property ownership
if (sc.hasOwn(obj, 'propertyName')) {
    // Property exists
}

// Type checking
sc.isObject(value); // true/false
sc.isArray(value); // true/false
sc.isFunction(value); // true/false

// Deep operations
let cloned = sc.deepClone(originalObject);
let merged = sc.deepMerge(obj1, obj2);

// Property manipulation
sc.getDef(obj, 'key', 'default'); // Get with default
sc.getOneDef(obj, ['key1', 'key2'], 'default'); // Get first found key
```

### ErrorManager
Singleton error handling utility with configurable tracing and custom error callbacks.

```javascript
const { ErrorManager } = require('@reldens/utils');

// Enable stack traces
ErrorManager.enableTrace = true;

// Custom error handling
ErrorManager.callback = (message) => {
    // Custom error handling logic
    console.error('Custom error:', message);
    // Return false to prevent default throw
    return false;
};

// Trigger error
ErrorManager.error('Something went wrong');
```

### EnvVar
Environment variable utilities with type conversion and validation for safe environment variable access.

```javascript
const { EnvVar } = require('@reldens/utils');

// Get environment variables with type conversion
let port = EnvVar.integer(process.env, 'PORT', 3000); // Returns integer or default
let enabled = EnvVar.boolean(process.env, 'FEATURE_ENABLED', false); // Returns boolean
let apiUrl = EnvVar.string(process.env, 'API_URL', 'http://localhost'); // Returns string

// Other type helpers
let portNumber = EnvVar.port(process.env, 'PORT', 8080); // Validates port range 1-65535
let config = EnvVar.json(process.env, 'CONFIG', {}); // Parse JSON string
let items = EnvVar.array(process.env, 'ITEMS', [], ','); // Split string to array
let url = EnvVar.url(process.env, 'API_URL', 'http://localhost'); // Validate URL
```

### ValidatorInterface
Base interface for creating custom validators with a standard validate method.

```javascript
const { ValidatorInterface } = require('@reldens/utils');

// Extend to create custom validators
class CustomValidator extends ValidatorInterface {
    validate(data) {
        // Custom validation logic
        if (!data.requiredField) {
            return false;
        }
        return true;
    }
}

let validator = new CustomValidator();
let isValid = validator.validate({ requiredField: 'value' });
```

---

Need something specific?

[Request a feature here: https://www.reldens.com/features-request](https://www.reldens.com/features-request)

---

## Documentation

[https://www.reldens.com/documentation/utils/](https://www.reldens.com/documentation/utils/)


---

### [Reldens](https://github.com/damian-pastorini/reldens/ "Reldens")

##### [By DwDeveloper](https://www.dwdeveloper.com/ "DwDeveloper")
