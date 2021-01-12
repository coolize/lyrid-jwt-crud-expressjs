const router = require('express').Router();
const quotes = require('./service');

/* GET quotes listing. */
router.get('/', async function(req, res, next) {
  try {
    res.json(await quotes.getMultiple(req.query.page, req.user.sub));
  } catch (err) {
    console.error(`Error while getting quotes `, err.message);
    res.status(err.statusCode || 500).json({'message': err.messagenpm });
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

/* PATCH quotes */
router.patch('/:quoteId', async function(req, res, next) {
    try {
      res.json(await quotes.updateQuote(req.params, req.body, req.user.sub));
    } catch (err) {
      console.error(`Error while posting quotes `, err.message);
      res.status(err.statusCode || 500).json({'message': err.message});
    }
});

/* DELETE quotes */
router.delete('/:quoteId', async function(req, res, next) {
    try {
      res.json(await quotes.deleteQuote(req.params, req.user.sub));
    } catch (err) {
      console.error(`Error while posting quotes `, err.message);
      res.status(err.statusCode || 500).json({'message': err.message});
    }
  });

module.exports = router;