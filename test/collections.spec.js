const Errors                    = require('../lib/errors');
const chai                      = require('chai');
const chaiHttp                  = require('chai-http');
const app                       = require('./demo/app');
const { before, describe, it }  = require('mocha');
const User                      = require('./demo/user.model');
const { expect }                = chai;
const BASE_PATH                 = '/schemaui';

chai.use(chaiHttp);

const defaultHeaders = {
    'Content-Type': 'application/json'
};

const defaultFilters = {
    search: '',
    itemsPerPage:10,
    page: 1
};

let existingUser;


describe('SchemaUI App', () => {
    before(async () => {
        User.deleteMany({}).exec();
    });

    it('Should load the dashboard page', async () => {
        const request = await chai.request(app).get(BASE_PATH);
        expect(request).to.have.status(200);
    });

    it('GET /api/collections', async () => {
        const request = await chai.request(app).get(BASE_PATH + '/api/collections');
        expect(request).to.have.status(200);
        expect(request.body).to.have.property('success').to.equal(true);
        expect(request.body).to.have.property('data')
            .to.have.property(User.modelName)
            .to.have.all.keys(['name', 'fields', 'options', 'index']);
    });

    it('POST /api/collections/:collectionName', async () => {
        const request = await chai.request(app).post(BASE_PATH + '/api/collections/' + User.modelName)
            .set('Content-Type', defaultHeaders['Content-Type'])
            .send(defaultFilters);
        expect(request).to.have.status(200);
        expect(request.body).to.have.property('success').to.equal(true);
    });

    it('POST /api/collections/:collectionName - should fail with non existing collection', async () => {
        const request = await chai.request(app).post(BASE_PATH + '/api/collections/NonExisting')
            .set('Content-Type', defaultHeaders['Content-Type'])
            .send(defaultFilters);
        expect(request).to.have.status(200);
        expect(request.body).to.have.property('success').to.equal(false);
        expect(request.body).to.have.property('data').to.equal(Errors.generalErrors.collectionNotFound);
    });

    it('POST /api/collections/:collectionName/save', async () => {
        const newUser = User.newUser().toObject();
        delete newUser._id;

        const request = await chai.request(app).post(BASE_PATH + '/api/collections/' + User.modelName + '/save')
            .set('Content-Type', defaultHeaders['Content-Type'])
            .send(newUser);
        expect(request).to.have.status(200);
        expect(request.body).to.have.property('success').to.equal(true);
        expect(request.body).to.have.property('data').to.have.property('_id');
    });

    it('POST /api/collections/:collectionName/save', async () => {
        const newUser = User.newUser().toObject();
        delete newUser._id;

        const request = await chai.request(app).post(BASE_PATH + '/api/collections/' + User.modelName + '/save')
            .set('Content-Type', defaultHeaders['Content-Type'])
            .send(newUser);
        expect(request).to.have.status(200);
        expect(request.body).to.have.property('success').to.equal(true);
        expect(request.body).to.have.property('data').to.have.property('_id');
        existingUser = request.body.data;
    });

    it('POST /api/collections/:collectionName/save - should fail with non existing user', async () => {
        const newUser = User.newUser().toObject();
        const request = await chai.request(app).post(BASE_PATH + '/api/collections/' + User.modelName + '/save')
            .set('Content-Type', defaultHeaders['Content-Type'])
            .send(newUser);
        expect(request).to.have.status(200);
        expect(request.body).to.have.property('success').to.equal(false);
        expect(request.body).to.have.property('data').to.equal(Errors.generalErrors.documentNotFound);
    });
});
