<h1 align="center">📶 NCU Net</h1>

<div align="center">

[![Latest version](https://img.shields.io/npm/v/ncu-net.svg?style=for-the-badge)](https://npm.im/ncu-net)
![npm downloads](https://img.shields.io/npm/dt/ncu-net.svg?style=for-the-badge)
[![License](https://img.shields.io/github/license/kidonng/ncu-net.svg?style=for-the-badge)](LICENSE)

English | [简体中文](README-zh-CN.md)

</div>

NCU Net is a command line client for _NCU Campus Network Access Authentication System_. Supports both `NCU-5G/NCU-2.4G` and `NCUWLAN`.

## Install

- npm: `npm i -g ncu-net`
- Yarn: `yarn global add ncu-net`
- [Binaries packed with Node.js for Windows, Linux & macOS](../../releases)

> We also provide an [user script](https://github.com/kidonng/cherry/tree/master/scripts#ncu-net) version.

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
  -t, --timing <time>    Config check interval & retry timeout
  -c, --config [file]      View config or load config from provided JSON file
  -V, --version            output the version number
  -h, --help               output usage information
```

**Notes:**

- NCU-5G/NCU-2.4G account format is `Username@ISP,Password`.
  - ISP: `cmcc`, `unicom`, `ndcard` or `ncu`
- NCUWLAN account format is `username,password`.
- Time format is `Check interval,Retry timeout` (in milliseconds).
  - We recommend setting retry timeout to no less than 10 seconds, because NCUWLAN needs a 10 seconds break between two logins.

You can also set up a daemon via a process manager (e.g. [pm2](https://github.com/Unitech/pm2)).

## Development

- Setup `yarn`
- Run `node src/ncu-net.js`

## Similar Projects

- [ncuwlan](https://github.com/maoyuqing/ncuwlan)
