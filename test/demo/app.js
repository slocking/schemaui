const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const Inaff = require('../../index');
const Form = require('./form.model');

const port = 4000;
Inaff.init();

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://127.0.0.1:27017/bodkim', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('DB Connected!'))
    .catch((e) => {
        console.log(`MongoDB connection failed - ${e.message}`);
        process.exit(0);
    });

Inaff.registerModel(Form);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/inaff', Inaff.middleware());

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

module.exports = server;
