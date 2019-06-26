const { createHmac, createHash } = require('crypto')

const md5hmac = (str, key) =>
  createHmac('md5', key)
    .update(str)
    .digest('hex')

const sha1 = str =>
  createHash('sha1')
    .update(str)
    .digest('hex')

module.exports = { md5hmac, sha1 }
