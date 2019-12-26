const Enum = require('../lib/enums');
const fieldTypes = Object.keys(Enum.FieldTypes);

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

    treeToFields (tree = {}) {
        const fields = {};
        const keys = Object.keys(tree);

        for (const key of keys) {
            if ('__v' === key) {
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

            if (fieldType) {
                fields[key] = {
                    key,
                    multi,
                    type: fieldType
                };
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