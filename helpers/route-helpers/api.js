const SchemaUI = require('../../index');
const pkg = require('../../package');
const BaseRoute = require('./base');
const escapeRegex = require('escape-string-regexp');
const Errors = require('../../lib/errors');
const _ = require('lodash');
const FieldTypes = require('../../lib/enums').FieldTypes;

class Api extends BaseRoute {
    async getConfig () {
        return {
            version: pkg.version,
        }
    }

    async getCollections () {
        const routes = {};
        for (let [key, value] of SchemaUI.SchemaUI.routesMap) {
            if (true === value.options.permissions.read) {
                routes[key] = value;
            }
        }

        return routes;
    }

    async getCollectionDocuments (request) {
        const collectionName = request.params.collection;
        const {
            search,
            itemsPerPage = 10,
            page = 1,
            sort
        } = request.body;

        const model = SchemaUI.SchemaUI.getModel(collectionName);
        const parsedModel = SchemaUI.SchemaUI.routesMap.get(collectionName);
        const fieldObj = parsedModel.fields;
        let fields = Object.keys(fieldObj);
        let match = {};
        const query = [
            { $skip: itemsPerPage * (page - 1) },
            { $limit: itemsPerPage }
        ];

        const { listFields } = parsedModel.options;

        if (Array.isArray(listFields) && listFields.length) {
            let projection = {};
            let newFields = [];

            for (const field of listFields) {
                if (fieldObj.hasOwnProperty(field) && Object.values(FieldTypes).includes(fieldObj[field].type)) {
                    projection[field] = 1;
                    newFields.push(field);
                }
            }

            fields = newFields;
            query.unshift({ $project: projection });
        }

        if (sort) {
            query.unshift({ $sort: sort });
        }

        if (search) {
            const $or = [];
            let termType = FieldTypes.String;
            let termValue = new RegExp(escapeRegex(search), 'i');

            if (/^[0-9a-z]{24}$/.test(search)) {
                termType = FieldTypes.ObjectId;
                termValue = model.base.Types.ObjectId(search);
            }

            for (const fieldKey in fieldObj) {
                const field = fieldObj[fieldKey];

                if (termType === field.type) {
                    $or.push({ [field.key]: termValue });
                }
            }

            if ($or.length) {
                match = { $or };
            }

            query.unshift({ $match: match });
        }

        return {
            fields,
            totalItems: (await model.countDocuments(match)),
            items: (await model.aggregate(query))
        };
    }

    removeCollectionDocument (request) {
        const { collectionName, documentId } = request.params;
        const model = SchemaUI.SchemaUI.getModel(collectionName);

        return model.findByIdAndDelete(model.base.Types.ObjectId(documentId));
    }

    async saveCollectionDocument (request) {
        const collectionName = request.params.collection;
        const model = SchemaUI.SchemaUI.getModel(collectionName);
        const parsedModel = SchemaUI.SchemaUI.routesMap.get(collectionName);
        const fields = Object.keys(parsedModel.fields);
        const newItem = request.body;
        let itemToSave = new model({});

        if (newItem.hasOwnProperty('_id')) {
            itemToSave = await model.findById(model.base.Types.ObjectId(newItem._id));

            if (!itemToSave) {
                throw new Error(Errors.generalErrors.documentNotFound);
            }
        }

        for (const field of fields) {
            if (_.has(newItem, field)) {
                const val = _.get(newItem, field);

                _.set(itemToSave, field, val);
            }
        }

        return itemToSave.save();
    }

    async getCollectionDocument (request) {
        const { collectionName, id } = request.params;
        const model = SchemaUI.SchemaUI.getModel(collectionName);

        return model.findById(model.base.Types.ObjectId(id));
    }

    async getCollectionInitialDocument (request) {
        const { collectionName } = request.params;
        const model = SchemaUI.SchemaUI.getModel(collectionName);
        const parsedModel = SchemaUI.SchemaUI.routesMap.get(collectionName);
        const fields = Object.keys(parsedModel.fields);
        const newModel = new model({}).toObject();
        delete newModel._id;

        for (const field of fields) {
            const fieldObj = parsedModel.fields[field];
            if (true === fieldObj.required && FieldTypes.Boolean === fieldObj.type) {
                _.set(newModel, field, false);
            }
        }

        return newModel;
    }
}

module.exports = new Api();
