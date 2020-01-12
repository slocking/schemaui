const SchemaUI = require('../../index');
const BaseRoute = require('./base');
const escapeRegex = require('escape-string-regexp');
const Errors = require('../../lib/errors');
const _ = require('lodash');
const FieldTypes = require('../../lib/enums').FieldTypes;

class Api extends BaseRoute {
    async getCollections () {
        return SchemaUI.SchemaUI.routesMap;
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
        const parsedModel = SchemaUI.SchemaUI.routesMap[collectionName];
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
            if (/^[0-9a-z]{24}$/.test(search)) {
                match = { _id: model.base.Types.ObjectId(search)  };
            } else {
                const orMatch = [];
                const regex = new RegExp(escapeRegex(search), 'i');

                for (const field of fields) {
                    if (FieldTypes.String !== fieldObj[field].type) {
                        continue;
                    }

                    if (true === fieldObj[field].multi) {
                        orMatch.push({ [field]: { $in: regex } })
                    } else {
                        orMatch.push({ [field]: regex })
                    }
                }

                if (orMatch.length) {
                    match = { $or: orMatch };
                }
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
        const parsedModel = SchemaUI.SchemaUI.routesMap[collectionName];
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
}

module.exports = new Api();