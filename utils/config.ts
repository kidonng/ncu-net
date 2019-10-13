import conf from 'conf'
import { ISP } from './constant'

interface Account {
  username: string
  password: string
}

interface NCUXGAccount extends Account {
  isp: keyof typeof ISP
}

const config = new conf<{
  check: number
  retry: number
  ncuxg?: NCUXGAccount
  ncuwlan?: Account
}>({
  defaults: {
    check: 3000,
    retry: 10000
  }
})

export { config }
