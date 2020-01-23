const express = require('express');
const ApiRoutes = new express.Router();
const ApiController = require('../helpers/route-helpers/api');

ApiRoutes.get(
    '/collections',
    ApiController.getCollections
);

ApiRoutes.post(
    '/collections/:collection',
    ApiController.getCollectionDocuments
);

ApiRoutes.delete(
    '/collections/:collectionName/:documentId',
    ApiController.removeCollectionDocument
);

ApiRoutes.post(
    '/collections/:collection/save',
    ApiController.saveCollectionDocument
);

ApiRoutes.get(
    '/collections/:collectionName/initial',
    ApiController.getCollectionInitialDocument
);

ApiRoutes.get(
    '/collections/:collectionName/:id',
    ApiController.getCollectionDocument
);


module.exports = ApiRoutes;