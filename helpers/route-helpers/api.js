const Inaff = require('../../index');
const BaseRoute = require('./base');

class Api extends BaseRoute {
    async getCollections () {
        return Inaff.Inaff.routesMap;
    }
}

module.exports = new Api();