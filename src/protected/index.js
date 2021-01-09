const router = require('express').Router();
const quotes = require('./service');

/* GET quotes listing. */
router.get('/', async function(req, res, next) {
  try {
    res.json(await quotes.getMultiple(req.query.page, req.user.sub));
  } catch (err) {
    console.error(`Error while getting quotes `, err.message);
    res.status(err.statusCode || 500).json({'message': err.message});
  }
});

/* POST quotes */
router.post('/', async function(req, res, next) {
  try {
    res.json(await quotes.create(req.body, req.user.sub));
  } catch (err) {
    console.error(`Error while posting quotes `, err.message);
    res.status(err.statusCode || 500).json({'message': err.message});
  }
});

module.exports = router;