const Enum = require('../lib/enums');
const _ = require('lodash');

class SequelizeAdapter {
    constructor () {
    }

    treeToFields (tree = {}) {
        const fields = {};
        const keys = Object.keys(tree);

        for (const key of keys) {
            fields[key] = {
                key,
                multi: false,
                type: Enum.FieldTypes.String,
                required: false
            };
        }

        return fields;
    }

    addOptionsToFields (fields, options = {}) {
        const fieldKeys = Object.keys(fields);

        for (const key of fieldKeys) {
            const field = fields[key];
            const fieldOptions = _.get(options, field.key);
            if ('object' === typeof fieldOptions && fieldOptions) {
                Object.assign(field, fieldOptions);
            }
        }
    }

    parseNewModel (newModel = {}, options) {
        const fields = this.treeToFields(newModel.rawAttributes);
        this.addOptionsToFields(fields, options.fields);

        return {
            name: newModel.name,
            fields
        }
    }

    addOptionsToModel (model, options = {}) {
        const {
            listFields = [],
            permissions = {}
        } = options;

        const modelPermissions = {
            [Enum.PermissionType.Read]: true,
            [Enum.PermissionType.Create]: true,
            [Enum.PermissionType.Edit]: true,
            [Enum.PermissionType.Delete]: true,
            ...permissions,
        }

        return {
            listFields,
            permissions: modelPermissions
        }
    }
}

module.exports = SequelizeAdapter;