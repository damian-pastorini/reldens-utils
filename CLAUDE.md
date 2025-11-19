# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

**@reldens/utils** is a core utility package used throughout the Reldens ecosystem. It provides essential utilities for:
- Object manipulation (Shortcuts class)
- Event management (EventsManager)
- Logging (Logger)
- Schema validation (SchemaValidator)
- Environment variables (EnvVar)
- Error handling (ErrorManager)
- Interaction area validation (InteractionArea)
- Pagination utilities (PageRangeProvider)
- Validator base interface (ValidatorInterface)

## Key Commands

```bash
# Run tests
npm test
```

## Architecture

### Core Classes

**Shortcuts** (`lib/shortcuts.js`):
- Provides utility methods for object manipulation, property access, and validation
- Imported as `sc` throughout the Reldens codebase
- Key methods: `get`, `hasOwn`, `isObject`, `isArray`, `deepMerge`, `deepClone`, etc.
- Used instead of direct property access or Object.prototype methods

**EventsManager** (`lib/events-manager.js`):
- Singleton event system used across Reldens
- Supports both sync (`emitSync`) and async (`emit`) events
- Allows event listeners to modify data via reference
- Debug mode available via `debug` property

**Logger** (`lib/logger.js`):
- Centralized logging utility with multiple log levels
- Levels: emergency, alert, critical, error, warning, notice, info, debug
- Configurable log level and trace options
- Used instead of console.log

**SchemaValidator** (`lib/schema-validator.js`):
- JSON schema validation utility
- Validates data structures against defined schemas
- Returns validation results with errors

**EnvVar** (`lib/env-var.js`):
- Environment variable utilities
- Type conversion and validation
- Safe environment variable access

**ErrorManager** (`lib/error-manager.js`):
- Singleton error handling utility
- Configurable error tracing via `enableTrace` property
- Supports custom error callbacks via `callback` property
- Default behavior throws Error with a message

**InteractionArea** (`lib/interaction-area.js`):
- Validates if positions are within interaction range
- Used for player-to-player, player-to-object interactions
- Configurable interaction area/margin
- Key methods: `setupInteractionArea`, `isValidInteraction`, `getPosition`

**PageRangeProvider** (`lib/page-range-provider.js`):
- Singleton pagination utility
- Generates page ranges for UI pagination
- Key method: `fetch(page, totalPages, totalDisplayedPages, firstLabel, lastLabel)`
- Returns array of page objects with label and value

**ValidatorInterface** (`lib/validator-interface.js`):
- Base interface for validator implementations
- Provides default `validate()` method that returns true
- Extend this class to create custom validators

## Important Notes

- This package has NO external dependencies
- All code must be pure JavaScript with no dependencies
- The Shortcuts class is used extensively across Reldens - any changes affect the entire ecosystem
- Singleton pattern is used for: ErrorManager, PageRangeProvider, and EventsManagerSingleton (exported alongside the EventsManager class)
- Logger methods should be used instead of console.log everywhere in Reldens
- InteractionArea is instantiable (not a singleton) - create instances for each interactive object
