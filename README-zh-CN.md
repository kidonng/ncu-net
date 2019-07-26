<h1 align="center">📶 NCU Net</h1>

<div align="center">

[![最新版本](https://img.shields.io/npm/v/ncu-net.svg?style=for-the-badge)](https://npm.im/ncu-net)
![npm 下载量](https://img.shields.io/npm/dt/ncu-net.svg?style=for-the-badge)
[![协议](https://img.shields.io/github/license/kidonng/ncu-net.svg?style=for-the-badge)](LICENSE)

[English](README.md) | 简体中文

</div>

NCU Net 是**南昌大学校园网络接入认证系统**的一个命令行客户端。同时支持 `NCU-5G/NCU-2.4G` 和 `NCUWLAN`。

![](screenshots/ncu-net.png)

## 安装

- npm: `npm i -g ncu-net`
- Yarn: `yarn global add ncu-net`
- Windows、Linux 和 macOS 的软件包: [Releases](../../releases)

> 同时也有[用户脚本版](https://github.com/kidonng/cherry/blob/master/scripts/README-zh-CN.md#ncu-net)。

## 特点

- 再无需手动认证
- 自动检测网络类型
- 自动重连
- 简明多彩的信息和日志

## 使用方法

如果没有提供选项，NCU Net 则会直接进行连接。

```
> ncu-net -h
使用方法: ncu-net [选项]

选项:
  -x, --ncuxg <帐号>     设置 NCU-5G/NCU-2.4G 帐号
  -w, --ncuwlan <帐号>   设置 NCUWLAN 帐号
  -t, --timing <设置>    设置检查间隔和重试延时
  -c, --config [文件]    查看设置或从提供的 JSON 文件读取设置
  -V, --version          查看版本号
  -h, --help             查看使用方法
```

**注意：**

- **参数用英文逗号 (`,`) 分隔且需按顺序提供。**
- NCU-5G/NCU-2.4G 帐号包括**用户名**、**ISP** (移动 `cmcc`、联通 `unicom`、电信 `ndcard`、校园网 `ncu`) 和**密码**。
- NCUWLAN 帐号包括**用户名**和**密码**。
- 时间设置包括**检查间隔**和**重试延时** (单位为毫秒)。
  - 推荐将重试延时设为不小于 10 秒，因为 NCUWLAN 要求两次登录间有 10 秒间隔。

你可能需要通过进程管理器设置一个守护进程 (例如 [pm2](https://github.com/Unitech/pm2))。

## 开发

- 安装依赖 `yarn`
- 运行 `node src/ncu-net.js`

## 类似项目

- [ncuwlan](https://github.com/maoyuqing/ncuwlan)
