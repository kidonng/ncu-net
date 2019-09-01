import conf from 'conf'
import { ISP } from './constant'

// NCUWLAN
interface Account {
  username: string
  password: string
}

interface NCUXGAccount extends Account {
  isp: keyof typeof ISP
}

const config = new conf<Account | NCUXGAccount | number>({
  defaults: {
    check: 3000,
    retry: 10000
  }
})

export { Account, NCUXGAccount, config }
