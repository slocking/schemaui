const express = require('express');
const ApiRoutes = new express.Router();
const ApiController = require('../helpers/route-helpers/api');
const Middlewares = require('../helpers/route-helpers/middleware');
const Permissions = require('../lib/enums').PermissionType;

ApiRoutes.get(
    '/config',
    ApiController.getConfig
);

ApiRoutes.get(
    '/collections',
    ApiController.getCollections
);

ApiRoutes.post(
    '/collections/:collection',
    Middlewares.hasPermissions([Permissions.Read]),
    ApiController.getCollectionDocuments
);

ApiRoutes.delete(
    '/collections/:collectionName/:documentId',
    Middlewares.hasPermissions([Permissions.Delete]),
    ApiController.removeCollectionDocument
);

ApiRoutes.post(
    '/collections/:collection/save',
    Middlewares.hasEitherPermission([Permissions.Edit, Permissions.Create]),
    ApiController.saveCollectionDocument
);

ApiRoutes.get(
    '/collections/:collectionName/initial',
    Middlewares.hasPermissions([Permissions.Create]),
    ApiController.getCollectionInitialDocument
);

ApiRoutes.get(
    '/collections/:collectionName/:id',
    Middlewares.hasPermissions([Permissions.Read]),
    ApiController.getCollectionDocument
);


module.exports = ApiRoutes;