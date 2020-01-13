/* eslint-disable no-console */

const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const SchemaUI = require('../../index');
const User = require('./user.model');

const port = 4000;
SchemaUI.init();

if (!process.env.MONGODB_URI) {
    console.log('It\'s dangerous to run this test without specifying MONGODB_URI...');
    process.exit(0);
}

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('DB Connected!'))
    .catch((e) => {
        console.log(`MongoDB connection failed - ${e.message}`);
        process.exit(0);
    });

SchemaUI.registerModel(User);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/schemaui', SchemaUI.middleware());

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

module.exports = server;
