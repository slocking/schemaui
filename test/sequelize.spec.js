const { before, describe, it }  = require('mocha');
const User                      = require('./demo/user-sequelize.model');
const chai = require("chai");
const app = require("./demo/app-sequelize");
const BASE_PATH                 = '/schemaui';

describe('SchemaUI App', () => {
    describe('GET /', async () => {
        it('should get the app index.html', async () => {
            const user = await User.createUser();

            console.log(user.toJSON());
        });
    });

    describe('GET /api/collections', async () => {
        it('should get all collections', async () => {
            const request = await chai.request(app).get(BASE_PATH + '/api/collections');
            expect(request).to.have.status(200);
            expect(request.body).to.have.property('success').to.equal(true);
            expect(request.body).to.have.property('data')
                .to.have.property(User.modelName)
                .to.have.all.keys(['name', 'fields', 'options', 'index']);
        });
    });
});
