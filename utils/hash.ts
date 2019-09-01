import { createHmac, createHash } from 'crypto'
import { encode } from '../lib/jquery-base64'
import { xEncode } from '../lib/xEncode'

const md5 = (str: string, key: string) =>
  createHmac('md5', key)
    .update(str)
    .digest('hex')

const sha1 = (str: string) =>
  createHash('sha1')
    .update(str)
    .digest('hex')

export { md5, sha1, encode as base64, xEncode }
