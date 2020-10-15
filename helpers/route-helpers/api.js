const SchemaUI                      = require('../../index');
const pkg                           = require('../../package');
const BaseRoute                     = require('./base');
const escapeRegex                   = require('escape-string-regexp');
const Errors                        = require('../../lib/errors');
const _                             = require('lodash');
const { FieldTypes, AuditTypes }    = require('../../lib/enums');
const { getAuditLogModel }          = require('../../lib/utils')

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

    removeCollectionDocument (request, response) {
        const { collectionName, documentId } = request.params;
        const model = SchemaUI.SchemaUI.getModel(collectionName);
        const auditLogModel = getAuditLogModel(model.base, model.db);

        if (true === SchemaUI.SchemaUI.options.auditLog) {
            new auditLogModel({
                type: AuditTypes.delete,
                collection_name: model.collection.name,
                document_id: documentId,
                initiator: (response.locals || {}).initiator
            })
                .save().catch(error => console.log(`error while trying to save audit log: ${error.message}`));
        }

        return model.findByIdAndDelete(model.base.Types.ObjectId(documentId));
    }

    async saveCollectionDocument (request, response) {
        const collectionName = request.params.collection;
        const model = SchemaUI.SchemaUI.getModel(collectionName);
        const auditLogModel = getAuditLogModel(model.base, model.db);
        const parsedModel = SchemaUI.SchemaUI.routesMap.get(collectionName);
        const allowedFields = Object.keys(parsedModel.fields);
        const existingId = request.body._id;
        const newItem = new model(request.body);
        let itemToSave = new model({});
        let auditLog = new auditLogModel({
            type: AuditTypes.create,
            collection_name: model.collection.name,
            document_id: newItem._id,
            modifiedFields: [],
            initiator: (response.locals || {}).initiator
        });

        if (existingId) {
            itemToSave = await model.findById(model.base.Types.ObjectId(existingId));

            if (!itemToSave) {
                throw new Error(Errors.generalErrors.documentNotFound);
            }

            auditLog.document_id = itemToSave._id;
            auditLog.type = AuditTypes.edit;
        }

        for (const field of allowedFields) {
            const oldValue = itemToSave.get(field);
            const newValue = newItem.get(field);

            if (AuditTypes.edit === auditLog.type
                && String(oldValue) !== String(newValue)) { // TODO: String comparison won't work for embedded document
                auditLog.modifiedFields.push({
                    field,
                    oldValue,
                    newValue
                });
            }

            itemToSave.set(field, newValue);
        }

        if (true === SchemaUI.SchemaUI.options.auditLog) {
            auditLog.save().catch(error => console.log(`error while trying to save audit log: ${error.message}`));
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
                const defaultBooleanValue = Boolean(fieldObj.default) || false;
                _.set(newModel, field, defaultBooleanValue);
            }
        }

        return newModel;
    }
}

module.exports = new Api();
