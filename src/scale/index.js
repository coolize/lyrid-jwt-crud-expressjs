/* eslint-disable toplevel/no-toplevel-side-effect */
const etag = require('etag')
const express = require('express')
const expressValidator = require('express-validator')
const got = require('got')
const sharp = require('sharp')
const transform = require('../../lib/transform')
const url = require('url')

const DEFAULT_QUALITY = 75
const DEFAULT_CROP_MAX_SIZE = 2000

module.exports = function(options = {}) {
  const router = express.Router()
  router.use(
    expressValidator({
      customValidators: {
        isSharpFormat: function(value) {
          return sharp.format.hasOwnProperty(value)
        },
        isGravity: function(value) {
          return sharp.gravity.hasOwnProperty(value)
        },
        isQuality: function(value) {
          return value >= 0 && value <= 100
        },
        isUrlPathQuery: function(value) {
          if (!value) {
            return false
          }
          return true
        },
      },
    })
  )

  const cropMaxSize = options.cropMaxSize || DEFAULT_CROP_MAX_SIZE

  // TODO: Refactor to reduce complexity
  // eslint-disable-next-line complexity, sonarjs/cognitive-complexity
  router.get('/resize/:width/:height?', async (req, res, next) => {
    let format = req.query.format
    if (req.headers.accept && req.headers.accept.includes('image/webp')) {
      format = format || 'webp'
    }

    const imageUrl = req.query.url
    const quality = parseInt(req.query.quality || DEFAULT_QUALITY, 10)

    req
      .checkParams('height')
      .optional()
      .isInt()
    req.checkParams('width').isInt()
    req
      .checkQuery('format')
      .optional()
      .isSharpFormat()
    req
      .checkQuery('quality')
      .optional()
      .isQuality()
    req
      .checkQuery('progressive')
      .optional()
      .isBoolean()
    req
      .checkQuery('crop')
      .optional()
      .isBoolean()
    req
      .checkQuery('gravity')
      .optional()
      .isGravity()
    req.checkQuery('url').isUrlPathQuery()

    const errors = req.validationErrors()
    if (errors) {
      res.status(400).json(errors)
      return
    }

    const width = parseInt(req.params.width, 10)
    const height = parseInt(req.params.height, 10) || null
    const crop = req.query.crop === 'true'
    const gravity = req.query.gravity

    try {
      const etagBuffer = Buffer.from([imageUrl, width, height, format, quality])
      res.setHeader('ETag', etag(etagBuffer, { weak: true }))
      if (req.fresh) {
        res.sendStatus(304)
        return
      }

      let response
      try {
        response = await got(imageUrl, {
          responseType: 'buffer',
        })
      } catch (error) {
        res.sendStatus(error.response.statusCode)
        return
      }


      res.status(response.statusCode)
      const inputFormat = response.headers['content-type'] || ''
      format = format || inputFormat.replace('image/', '')

      format = sharp.format.hasOwnProperty(format) ? format : 'jpeg'

      res.type(`image/${format}`)
      const image = await transform(response.body, {
        crop,
        cropMaxSize,
        gravity,
        height,
        quality,
        width,
        format,
      })
      res.send(image)
    } catch (error) {
      if (error.statusCode === 404) {
        next()
        return
      }
      next(error)
    }
  })

  return router
}