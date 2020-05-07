const SchemaUI = require('../../index');
const Errors = require('../../lib/errors');

class Middleware {
    static hasPermissions (actions) {
        return function (request, response, next) {
            const collectionName = request.params.collection || request.params.collectionName;

            const parsedModel = SchemaUI.SchemaUI.routesMap.get(collectionName);

            if (!parsedModel) {
                return response.json({ success: false, data: Errors.generalErrors.collectionNotFound });
            }

            for (const action of actions) {
                if (false === parsedModel.options.permissions[action]) {
                    return response.json({ success: false, data: Errors.generalErrors.insufficientPermissions });
                }
            }

            return next();
        }
    }

    static hasEitherPermission (actions) {
        return function (request, response, next) {
            const collectionName = request.params.collection || request.params.collectionName;
            let hasPermission = false;

            const parsedModel = SchemaUI.SchemaUI.routesMap.get(collectionName);

            if (!parsedModel) {
                return response.json({ success: false, data: Errors.generalErrors.collectionNotFound });
            }

            for (const action of actions) {
                if (true === parsedModel.options.permissions[action]) {
                    hasPermission = true;

                    break;
                }
            }

            if (true === hasPermission) {
                return next();
            }

            return response.json({ success: false, data: Errors.generalErrors.insufficientPermissions });
        }
    }
}

module.exports = Middleware;
