const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./demo/app');

chai.use(chaiHttp);
const { expect } = chai;

describe('Inaff App', () => {
    it('Should init /inaff route with status code 200', async () => {
        const request = await chai.request(app).get('/inaff');
        expect(request).to.have.status(200);
    });
});
