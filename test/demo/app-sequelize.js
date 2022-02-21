const express = require('express');
const http = require('http');
const SchemaUI = require('../../index');
const User = require('./user-sequelize.model');
const sequelizeAdapter = require('../../adapters/sequelize');

const port = 4000;
SchemaUI.init({
    adapter: sequelizeAdapter
});

SchemaUI.registerModel(User, {
    listFields: ['email', 'firstName']
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/schemaui', SchemaUI.middleware());

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

module.exports = server;
