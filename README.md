<h1 align="center">📶 NCU Net</h1>

<div align="center">
  
  [![npm](https://img.shields.io/npm/v/ncu-net.svg?style=for-the-badge)](https://npm.im/ncu-net)
  ![npm](https://img.shields.io/npm/dt/ncu-net.svg?style=for-the-badge)
  [![GitHub](https://img.shields.io/github/license/kidonng/ncu-net.svg?style=for-the-badge)](./LICENSE)
  
</div>

NCU Net is a client for NCU Campus Network Access Authentication System. Supports both `NCU-5G/NCU-2.4G` and `NCUWLAN`.

## Install

- npm: `npm i -g ncu-net`
- Yarn: `yarn global add ncu-net`
- Packaged version for Windows, Linux & macOS in [releases](../../releases)

> There is an [user script version](https://github.com/kidonng/cherry/tree/master/scripts#ncu-net) as well.

## Features

- No more manual authentication
- Auto detect access point type
- Auto reconnect
- Concise & colorful messages and logs

## Usage

If no option is provided, NCU Net will make a connection.

```
> ncu-net -h
Usage: ncu-net [options]

Options:
  -x, --ncuxg <account>    Config NCU-5G/NCU-2.4G account
  -w, --ncuwlan <account>  Config NCUWLAN account
  -t, --timing <config>    Config check interval & retry timeout
  -c, --config [file]      View config or load config from provided JSON file
  -V, --version            output the version number
  -h, --help               output usage information
```

**Notes:**

- Parameters are splited by commas (`,`) and should be provided in order.
- NCU-5G/NCU-2.4G account contains **username**, **ISP** (`cmcc`, `unicom`, `ndcard` or `ncu`) and **password**.
- NCUWLAN account contains **username** and **password**.
- Timing config contains **check interval** and **retry timeout** (in milliseconds).
  - We recommend setting retry timeout to set no less than 10s because NCUWLAN needs a 10s break between two logins.

You can also setup a daemon via a process manager (e.g. pm2).

## Development

- Setup `yarn`
- Run `node index`

## Related

- [ncuwlan](https://github.com/maoyuqing/ncuwlan)
