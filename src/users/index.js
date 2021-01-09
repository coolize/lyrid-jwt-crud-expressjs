const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// users hardcoded for simplicity, store in a db for production applications
const users = require('./list');

// routes
router.post('/login', authenticate);

function authenticate(req, res) {
    const user = users.find(u => u.username === req.body.username && u.password === req.body.password);

    if (!user) throw 'Username or password is incorrect';

    // create a jwt token that is valid for 7 days
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
        ...omitPassword(user),
        token
    })

}

function omitPassword(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

module.exports = router;