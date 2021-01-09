'use strict';

// eslint-disable-next-line import/no-unresolved
const express = require('express');
const app = express();
const scale = require('../scale')

app.use(express.json())
app.use(express.urlencoded({extended: true}))

var cors = require('cors')

var corsOptions = {
  origin: [ 'http://localhost:5000' ],
  credentials: true,
}

app.use(cors(corsOptions))

var morgan = require('morgan')
app.use(morgan('combined'))

// Routes
app.all('/', (req, res) => {
  res.json(
      { apis: [
              {'[GET] /echo/*':'return url back as response'},
              {'[GET] /sharp':'sharp image processing endpoint'},
              {'[POST] /login':'endpoint to login. send request: [POST] username,password to get bearer token'},
              {'[GET/POST] /quotes':'(token required) CRUD endpoint'},
        ] });
});


app.all('/echo/*', (req, res) => {
  res.send(`Request received: ${req.method} - ${req.path}`);
});

app.use('/sharp', scale())

// use JWT auth to secure the api
const jwt = require('../protected/jwt')
app.use(jwt());

// Authentication endpoint
app.use(require('../users'))

// Protected Routes
app.use('/quotes', require('../protected/'))

// Error handler
app.use((err, req, res, next) => {

  if (err.name === 'UnauthorizedError') {
    // jwt authentication error
    return res.status(401).json({ message: 'Invalid Token' });
  }

  res.status(500).send('Internal Serverless Error: ' + err);
});

module.exports = app;
