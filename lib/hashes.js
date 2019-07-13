const { createHmac, createHash } = require('crypto')

const stdTab =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/' + '='
const customTab =
  'LVoJPiCN2R8G90yg+hmFHuacZ1OWMnrsSTXkYpUq/3dlbfKwv6xztjI7DeBE45QA' + '='
const map = str =>
  [...str].map(char => customTab[stdTab.indexOf(char)]).join('')

const base64encode = str => Buffer.from(str).toString('base64')
const customb64 = str => map(base64encode(str))
const md5hmac = (str, key) =>
  createHmac('md5', key)
    .update(str)
    .digest('hex')
const sha1 = str =>
  createHash('sha1')
    .update(str)
    .digest('hex')

module.exports = { base64encode, customb64, md5hmac, sha1 }
