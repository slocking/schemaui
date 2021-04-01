const path = require('path');
const express = require('express');
const Api = require('../routes/api');
const Errors = require('../lib/errors');
const MongooseAdapter = require('../adapters/mongoose');

class SchemaUI {
    middleware () {
        this.initRoutes();

        return this.router;
    }

    registerModel (newModel, options = {}) {
        const model = this.adapter.parseNewModel(newModel, options);
        model.options = this.adapter.addOptionsToModel(model, options);
        model.index = (this.models.push(newModel)) - 1;

        this.routesMap.set(model.name, model);
    }

    getModel (modelName) {
        const existingModel = this.routesMap.get(modelName);

        if (!existingModel) {
            throw new Error(Errors.generalErrors.collectionNotFound);
        }

        return this.models[existingModel.index];
    }

    init (options = {}) {
        this.options = this.prepareGlobalOptions(options);
        this.models = [];
        this.routesMap = new Map();
        this.adapter = new (options.adapter || MongooseAdapter)();
        this.router = new express.Router();
    }

    prepareGlobalOptions (customOptions) {
        return {
            auditLog: true,
            ...customOptions
        }
    }

    initRoutes () {
        this.router.use('/api', Api);
        this.router.use(express.static(path.resolve(__dirname, '../dist')));
        this.router.use('*', (req, res) => res.sendFile(path.resolve(__dirname, '../dist/index.html')));
    }
}

module.exports = SchemaUI;
