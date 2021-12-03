const { before, describe, it }  = require('mocha');
const User                      = require('./demo/user-sequelize.model');

describe('SchemaUI App', () => {
    describe('GET /', async () => {
        it('should get the app index.html', async () => {
            const user = await User.createUser();

            console.log(user.toJSON());
        });
    });
});
