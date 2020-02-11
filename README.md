# Schema UI

[![NPM version](https://img.shields.io/npm/v/schemaui.svg)](https://npmjs.org/package/codecov)
[![Build Status](https://travis-ci.com/slocking/schemaui.svg?branch=master)](https://travis-ci.com/slocking/schemaui)
[![codecov.io](http://codecov.io/github/slocking/schemaui/coverage.svg?branch=master)](http://codecov.io/github/slocking/schemaui?branch=master)

Turn every mongoose schema, into a shiny, slick, good looking UI, that will help you manage fully CRUD operations to your registered models.

## Installation

Just import SchemaUI package, register your models, and  

![Schema UI code](https://user-images.githubusercontent.com/7160836/72008529-b8618400-325c-11ea-9919-0f346808b1ec.png)

SchemaUI should be installed with few little steps:

1. Import Schema UI
```javascript
const SchemaUI = require('schemaui');
```

2. Initialize Schema UI with options (TBD)
```javascript
SchemaUI.init({});
```

3. Register your model
```javascript
SchemaUI.registerModel(YOUR_MODEL);
```

4. Connect the middleware to your app
```javascript
app.use('/schemaui', SchemaUI.middleware());
```

## The result

Intuitive, responsive, generic CRM dashboard, that created to help you manage your models

![Schema UI Dashboard](https://user-images.githubusercontent.com/7160836/72006783-04122e80-3259-11ea-9079-73003ef679ac.png)

## Documentation

### SchemaUI.init([options])
`options` (optional) - global options for SchemaUI instance (TBD)

### SchemaUI.registerModel(Model, [options])
*this method should be called multiple times, for every model that you wish to include in the admin UI*

`Model` - A single mongoose model you wish to include in the generated UI

`options` (optional) - An object with properties, that define set of options per single model (collection)

| Property      |   Type    | Description           |
| :---------    | :---      | :---                  |
| listFields    | String[]  | array of strings that defines which fields to display per item in the items view  |

### SchemaUI.middleware()
Initiates express router that injects the admin UI into your existing app.

*Schema UI middleware must be under `/schemaui` route, any other route will not be able to load SchemaUI's admin panel*

## Demo
Live demo & source code can be found [here](https://github.com/slocking/schemaui-demo)
