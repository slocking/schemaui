const path = require('path');
const express = require('express');
const Api = require('../routes/api');
const Errors = require('../lib/errors');
const MongooseAdapter = require('../adapters/mongoose');

class Inaff {
    middleware () {
        this.initRoutes();

        return this.router;
    }

    getDbAdapter () {
        return new (this.options.adapter || MongooseAdapter)();
    }

    registerModel (newModel, options = {}) {
        const model = this.adapter.parseNewModel(newModel);
        model.options = options;
        model.index = (this.models.push(newModel)) - 1;

        this.routesMap[model.name] = model;
    }

    getModel (modelName) {
        const existingModel = this.routesMap[modelName];

        if (!existingModel) {
            throw new Error(Errors.generalErrors.collectionNotFound);
        }

        return this.models[existingModel.index];
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
        this.router.use('/api', Api);
        this.router.use(express.static(path.resolve(__dirname, '../dist')));
        this.router.use('*', (req, res) => res.sendFile(path.resolve(__dirname, '../dist/index.html')));
    }
}

module.exports = Inaff;