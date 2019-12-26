const express = require('express');
const ApiRoutes = new express.Router();
const ApiController = require('../helpers/route-helpers/api');

ApiRoutes.get(
    '/collections',
    ApiController.getCollections
);

module.exports = ApiRoutes;