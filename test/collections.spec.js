const Errors                    = require('../lib/errors');
const chai                      = require('chai');
const chaiHttp                  = require('chai-http');
const app                       = require('./demo/app');
const { before, describe, it }  = require('mocha');
const User                      = require('./demo/user.model');
const Image                     = require('./demo/image.model');
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

    describe('GET /', async () => {
        it('should get the app index.html', async () => {
            const request = await chai.request(app).get(BASE_PATH + '/');
            expect(request).to.have.status(200);
            expect(request.text).to.include(`<title>SchemaUI Dashboard</title>`);
        });

        it('404 should get also the app index.html', async () => {
            const request = await chai.request(app).get(BASE_PATH + '/404page');
            expect(request).to.have.status(200);
            expect(request.text).to.include(`<title>SchemaUI Dashboard</title>`);
        });
    });

    describe('GET /api/config', async () => {
        it('should get the config', async () => {
            const request = await chai.request(app).get(BASE_PATH + '/api/config');
            expect(request).to.have.status(200);
            expect(request.body).to.have.property('success').to.equal(true);
            expect(request.body.data).to.have.property('version').to.be.a('string');
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

    describe('GET /api/collections/:collectionName/initial', async () => {
        it('should empty collection model with initiated values', async () => {
            const request = await chai.request(app).get(BASE_PATH + `/api/collections/${User.modelName}/initial`);
            expect(request).to.have.status(200);
            expect(request.body).to.have.property('success').to.equal(true);
            expect(request.body).to.have.property('data')
                .to.have.property('isActive')
                .to.equal(true);
        });
    });

    describe('POST /api/collections/:collectionName', async () => {
        it('should fetch a collection documents', async () => {
            const request = await chai.request(app).post(BASE_PATH + '/api/collections/' + User.modelName)
                .set('Content-Type', defaultHeaders['Content-Type'])
                .send(defaultFilters);
            expect(request).to.have.status(200);
            expect(request.body).to.have.property('success').to.equal(true);
        });

        it('should fail with non existing collection', async () => {
            const request = await chai.request(app).post(BASE_PATH + '/api/collections/NonExisting')
                .set('Content-Type', defaultHeaders['Content-Type'])
                .send(defaultFilters);
            expect(request).to.have.status(200);
            expect(request.body).to.have.property('success').to.equal(false);
            expect(request.body).to.have.property('data').to.equal(Errors.generalErrors.collectionNotFound);
        });
    });

    describe('POST /api/collections/:collectionName/save', async () => {
        it('should create a new document', async () => {
            const newUser = User.newUser().toObject();
            delete newUser._id;

            const request = await chai.request(app).post(BASE_PATH + '/api/collections/' + User.modelName + '/save')
                .set('Content-Type', defaultHeaders['Content-Type'])
                .send(newUser);
            expect(request).to.have.status(200);
            expect(request.body).to.have.property('success').to.equal(true);
            expect(request.body).to.have.property('data').to.have.property('_id');
        });

        it('should edit a document', async () => {
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
    });

    describe('GET /api/collections/:collectionName/:id', async () => {
        it('should fetch a user', async () => {
            const request = await chai.request(app).get(BASE_PATH + `/api/collections/${User.modelName}/${existingUser._id}`)
                .set('Content-Type', defaultHeaders['Content-Type']);
            expect(request).to.have.status(200);
            expect(request.body).to.have.property('success').to.equal(true);
            expect(request.body).to.have.property('data').to.have.property('_id');
        });
    });

    describe('POST /api/collections/:collectionName/save - edit user fields', async () => {
        it('should edit user fields', async () => {
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

        it('should add additional user', async () => {
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

        it('should fail with non existing user', async () => {
            const newUser = User.newUser().toObject();
            const request = await chai.request(app).post(BASE_PATH + '/api/collections/' + User.modelName + '/save')
                .set('Content-Type', defaultHeaders['Content-Type'])
                .send(newUser);
            expect(request).to.have.status(200);
            expect(request.body).to.have.property('success').to.equal(false);
            expect(request.body).to.have.property('data').to.equal(Errors.generalErrors.documentNotFound);
        });
    });

    describe('POST /api/collections/:collectionName', async () => {
        it('should test sorting functionality', async () => {
            const request = await chai.request(app).post(BASE_PATH + '/api/collections/' + User.modelName)
                .set('Content-Type', defaultHeaders['Content-Type'])
                .send({ ...defaultFilters, sort: { '_id': -1 } });
            expect(request).to.have.status(200);
            expect(request.body).to.have.property('success').to.equal(true);
            expect(request.body.data.items[0]).to.have.property('_id').to.be.equal(String(existingUser2._id));
            expect(request.body.data.items[1]).to.have.property('_id').to.be.equal(String(existingUser._id));
        });

        it('should search by user id', async () => {
            const request = await chai.request(app).post(BASE_PATH + '/api/collections/' + User.modelName)
                .set('Content-Type', defaultHeaders['Content-Type'])
                .send({ ...defaultFilters, search: existingUser._id });
            expect(request).to.have.status(200);
            expect(request.body).to.have.property('success').to.equal(true);
            expect(request.body).to.have.property('data').to.have.property('items').to.have.length(1);
            expect(request.body.data.items[0]).to.have.property('_id').to.be.equal(String(existingUser._id));
        });

        it('search by user\'s field', async () => {
            const request = await chai.request(app).post(BASE_PATH + '/api/collections/' + User.modelName)
                .set('Content-Type', defaultHeaders['Content-Type'])
                .send({ ...defaultFilters, search: existingUser.email });
            expect(request).to.have.status(200);
            expect(request.body).to.have.property('success').to.equal(true);
            expect(request.body).to.have.property('data').to.have.property('items').to.have.length(1);
            expect(request.body.data.items[0]).to.have.property('email').to.be.equal(existingUser.email);
        });
    });

    describe('DELETE /collections/:collectionName/:documentId', async () => {
        it('should delete a document', async () => {
            const request = await chai.request(app)
                .delete(`${BASE_PATH}/api/collections/${User.modelName}/${existingUser._id}`);
            expect(request.body).to.have.property('success').to.equal(true);
            expect(request.body).to.have.property('data').not.to.equal(null);
        });

        it('should fail on deleting non existing document', async () => {
            const newUser = User.newUser().toObject();
            const request = await chai.request(app)
                .delete(`${BASE_PATH}/api/collections/${User.modelName}/${newUser._id}`);
            expect(request.body).to.have.property('success').to.equal(true);
            expect(request.body).to.have.property('data').to.equal(null);
        });
    });

    describe('Permissions Test', async () => {
        it('should fail create without create permission', async () => { // create
            const newImage = Image.newImage().toObject();
            delete newImage._id;

            const request = await chai.request(app).post(BASE_PATH + '/api/collections/' + Image.modelName + '/save')
                .set('Content-Type', defaultHeaders['Content-Type'])
                .send(newImage);
            expect(request).to.have.status(200);
            expect(request.body).to.have.property('success').to.equal(false);
            expect(request.body).to.have.property('data').to.equal(Errors.generalErrors.insufficientPermissions);
        });

        it('should fail create for non existing model', async () => { // edit
            const newImage = Image.newImage().toObject();
            delete newImage._id;

            const request = await chai.request(app).post(BASE_PATH + '/api/collections/NonExisting/save')
                .set('Content-Type', defaultHeaders['Content-Type'])
                .send(newImage);
            expect(request).to.have.status(200);
            expect(request.body).to.have.property('success').to.equal(false);
            expect(request.body).to.have.property('data').to.equal(Errors.generalErrors.collectionNotFound);
        });

        it('should fail edit without read permissions', async () => { // read
            const newImage = Image.newImage().toObject();

            const request = await chai.request(app).get(`${BASE_PATH}/api/collections/${Image.modelName}/${String(newImage._id)}`)
                .set('Content-Type', defaultHeaders['Content-Type'])
            expect(request).to.have.status(200);
            expect(request.body).to.have.property('success').to.equal(false);
            expect(request.body).to.have.property('data').to.equal(Errors.generalErrors.insufficientPermissions);
        });

        it('should fail delete without delete permissions', async () => { // delete
            const newImage = Image.newImage().toObject();

            const request = await chai.request(app).delete(`${BASE_PATH}/api/collections/${Image.modelName}/${String(newImage._id)}`)
            expect(request).to.have.status(200);
            expect(request.body).to.have.property('success').to.equal(false);
            expect(request.body).to.have.property('data').to.equal(Errors.generalErrors.insufficientPermissions);
        });
    });
});
