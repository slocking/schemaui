const path = require('path');
const express = require('express');
const Api = require('../routes/api');
const MongooseAdapter = require('../adapters/mongoose');

class Inaff {
    middleware () {
        this.initRoutes();

        return this.router;
    }

    getDbAdapter () {
        return new (this.options.adapter || MongooseAdapter)();
    }

    registerModel (newModel) {
        const model = this.adapter.parseNewModel(newModel);
        model.index = (this.models.push(newModel)) - 1;

        this.routesMap[model.name] = model;
    }

    getModel (modelName) {
        return this.models[this.routesMap[modelName].index];
    }

    init (options = {}) {
        this.options = options;
        this.models = [];
        this.routesMap = {};
        this.adapter = new (options.adapter || MongooseAdapter)();
        this.router = new express.Router();
    }

    getRoutes () {
        return this.routesMap;
    }

    initRoutes () {
        this.router.use(express.static(path.resolve(__dirname, '../dist')));
        this.router.use('/api', Api);
    }
}

module.exports = Inaff;