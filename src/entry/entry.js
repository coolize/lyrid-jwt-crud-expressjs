'use strict';

// eslint-disable-next-line import/no-unresolved
const express = require('express');
const app = express();
const scale = require('../scale')
var cors = require('cors')

var corsOptions = {
  origin: [ 'http://localhost:5000' ],
  credentials: true,
}

app.use(cors(corsOptions))

var morgan = require('morgan')
app.use(morgan('combined'))

// Routes
app.all('/echo/*', (req, res) => {
  res.send(`Request received: ${req.method} - ${req.path}`);
});

app.use('/sharp', scale())

// Error handler
app.use((err, req, res, next) => {
  res.status(500).send('Internal Serverless Error: ' + err);
});

module.exports = app;
