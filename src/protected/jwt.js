const expressJwt = require('express-jwt');
const { pathToRegexp } = require('path-to-regexp');

// Use JWT auth to secure the API
const unprotected = [
    pathToRegexp('/echo/:path'),
    pathToRegexp('/sharp/:path'),
    pathToRegexp('/login'),
    pathToRegexp('/')
];

function jwt() {
    const secret = process.env.JWT_SECRET;
    return expressJwt({ secret, algorithms: ['HS256'] }).unless({
        path: unprotected
    });
}

module.exports = jwt;
