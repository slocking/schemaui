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
let existingUser2;


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

    it('GET /api/collections/:collectionName/initial', async () => {
        const request = await chai.request(app).get(BASE_PATH + `/api/collections/${User.modelName}/initial`);
        expect(request).to.have.status(200);
        expect(request.body).to.have.property('success').to.equal(true);
        expect(request.body).to.have.property('data')
            .to.have.property('isActive')
            .to.equal(true);
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

    it('GET /api/collections/:collectionName/:id', async () => {
        const request = await chai.request(app).get(BASE_PATH + `/api/collections/${User.modelName}/${existingUser._id}`)
            .set('Content-Type', defaultHeaders['Content-Type']);
        expect(request).to.have.status(200);
        expect(request.body).to.have.property('success').to.equal(true);
        expect(request.body).to.have.property('data').to.have.property('_id');
    });

    it('POST /api/collections/:collectionName/save - edit user fields', async () => {
        const newFirstName  = 'custom_modified';
        existingUser.firstName = newFirstName;

        const request = await chai.request(app).post(BASE_PATH + '/api/collections/' + User.modelName + '/save')
            .set('Content-Type', defaultHeaders['Content-Type'])
            .send(existingUser);
        expect(request).to.have.status(200);
        expect(request.body).to.have.property('success').to.equal(true);
        expect(request.body).to.have.property('data').to.have.property('firstName').to.equal(newFirstName);
        existingUser = request.body.data;
    });

    it('POST /api/collections/:collectionName/save - add additional user', async () => {
        const newUser2 = User.newUser().toObject();
        delete newUser2._id;

        const request = await chai.request(app).post(BASE_PATH + '/api/collections/' + User.modelName + '/save')
            .set('Content-Type', defaultHeaders['Content-Type'])
            .send(newUser2);
        expect(request).to.have.status(200);
        expect(request.body).to.have.property('success').to.equal(true);
        expect(request.body).to.have.property('data').to.have.property('_id');
        existingUser2 = request.body.data;
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

    it('POST /api/collections/:collectionName - test sorting functionality', async () => {
        const request = await chai.request(app).post(BASE_PATH + '/api/collections/' + User.modelName)
            .set('Content-Type', defaultHeaders['Content-Type'])
            .send({ ...defaultFilters, sort: { '_id': -1 } });
        expect(request).to.have.status(200);
        expect(request.body).to.have.property('success').to.equal(true);
        expect(request.body.data.items[0]).to.have.property('_id').to.be.equal(String(existingUser2._id));
        expect(request.body.data.items[1]).to.have.property('_id').to.be.equal(String(existingUser._id));
    });

    it('POST /api/collections/:collectionName - search by user id', async () => {
        const request = await chai.request(app).post(BASE_PATH + '/api/collections/' + User.modelName)
            .set('Content-Type', defaultHeaders['Content-Type'])
            .send({ ...defaultFilters, search: existingUser._id });
        expect(request).to.have.status(200);
        expect(request.body).to.have.property('success').to.equal(true);
        expect(request.body).to.have.property('data').to.have.property('items').to.have.length(1);
        expect(request.body.data.items[0]).to.have.property('_id').to.be.equal(String(existingUser._id));
    });

    it('POST /api/collections/:collectionName - search by user\'s field', async () => {
        const request = await chai.request(app).post(BASE_PATH + '/api/collections/' + User.modelName)
            .set('Content-Type', defaultHeaders['Content-Type'])
            .send({ ...defaultFilters, search: existingUser.email });
        expect(request).to.have.status(200);
        expect(request.body).to.have.property('success').to.equal(true);
        expect(request.body).to.have.property('data').to.have.property('items').to.have.length(1);
        expect(request.body.data.items[0]).to.have.property('email').to.be.equal(existingUser.email);
    });
});
