const Enum = require('../lib/enums');
const fieldTypes = Object.keys(Enum.FieldTypes);
const _ = require('lodash');

class MongooseAdapter {
    constructor () {
    }

    getFieldType (field) {
        if (['object', 'function'].includes(typeof field)
            && field.hasOwnProperty('name')
            && fieldTypes.includes(field.name)
        ) {
            return Enum.FieldTypes[field.name];
        }
    }

    treeToFields (tree = {}, fields = {}, nestedFields = []) {
        const keys = Object.keys(tree);

        for (const key of keys) {
            if ('_id' === key) {
                fields[key] = {
                    key,
                    multi: false,
                    type: Enum.FieldTypes.ObjectId,
                    required: false
                };

                continue;
            } else if ('__v' === key) {
                continue;
            }

            let field;
            let multi = false;
            if (Enum.FieldTypes.Object === typeof tree[key] && tree[key].hasOwnProperty('type')) {
                field = tree[key].type;
            } else {
                field = tree[key]
            }

            if (Array.isArray(field)) {
                field = field[0];
                multi = true;
            }

            const fieldType = this.getFieldType(field);

            if (false === multi && Enum.FieldTypes.Object === typeof field) {
                const nested = _.clone(nestedFields);
                nested.push(key);
                this.treeToFields(field, fields, nested);

            } else if (fieldType) {
                const targetKey = nestedFields.length ? [...nestedFields, key].join('.') : key;

                fields[targetKey] = {
                    key: targetKey,
                    multi,
                    type: fieldType,
                    required: tree[key].required || false
                };

                if (Array.isArray(tree[key].enum) && tree[key].enum.length) {
                    fields[targetKey].enum = tree[key].enum;
                }
            }
        }

        return fields;
    }

    parseNewModel (newModel = {}) {
        const tree = newModel.schema.tree;
        const fields = this.treeToFields(tree);


        return {
            name: newModel.modelName,
            fields
        }
    }
}

module.exports = MongooseAdapter;