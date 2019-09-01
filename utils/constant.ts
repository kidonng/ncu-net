import { version } from '../package.json'

const AP = {
  ncuxg: {
    name: 'NCU-5G/NCU-2.4G',
    origin: 'http://222.204.3.154'
  },
  ncuwlan: {
    name: 'NCUWLAN',
    origin: 'http://222.204.3.221'
  }
}

const ISP = {
  cmcc: 'China Mobile',
  unicom: 'China Unicom',
  ndcard: 'China Telecom',
  ncu: 'Nanchang University'
}

export { AP, ISP, version }
