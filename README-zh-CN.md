<h1 align="center">📶 NCU Net</h1>

<div align="center">

[![npm](https://img.shields.io/npm/v/ncu-net.svg?style=for-the-badge)](https://npm.im/ncu-net)
![npm](https://img.shields.io/npm/dt/ncu-net.svg?style=for-the-badge)
[![GitHub](https://img.shields.io/github/license/kidonng/ncu-net.svg?style=for-the-badge)](./LICENSE)

[English](README.md) | 简体中文

</div>

NCU Net 是**南昌大学校园网络接入认证系统**的一个客户端。同时支持 `NCU-5G/NCU-2.4G` 和 `NCUWLAN`。

## 安装

- npm: `npm i -g ncu-net`
- Yarn: `yarn global add ncu-net`
- Windows、Linux 和 macOS 的软件包: [Releases](../../releases)

> 同时也有[用户脚本版](https://github.com/kidonng/cherry/blob/master/scripts/README-zh-CN.md#ncu-net)。

## 特点

- 跟手动认证说再见
- 自动检测网络类型
- 自动重连
- 简明且多彩的信息和日志

## 使用方法

如果没有提供选项，NCU Net 则会进行连接。

```
> ncu-net -h
使用方法: ncu-net [选项]

选项:
  -x, --ncuxg <帐号>     设置 NCU-5G/NCU-2.4G 帐号
  -w, --ncuwlan <帐号>   设置 NCUWLAN 帐号
  -t, --timing <设置>    设置检查间隔和重试延时
  -c, --config [文件]    查看设置或从提供的 JSON 文件读取设置
  -V, --version          显示版本号
  -h, --help             显示使用方法
```

**注意：**

- **参数用英文逗号 (`,`) 分隔且需按顺序提供。**
- NCU-5G/NCU-2.4G 帐号包括**用户名**、**ISP** (移动 `cmcc`、联通 `unicom`、电信 `ndcard`、校园网 `ncu`) 和**密码**。
- NCUWLAN 帐号包括**用户名**和**密码**.
- 时间设置包括**检查间隔**和**重试延时** (单位为毫秒).
  - 推荐将重试延时设为不小于 10 秒，因为 NCUWLAN 要求两次登录间有 10 秒间隔。

你可能需要通过进程管理器设置一个守护进程 (例如 [pm2](https://github.com/Unitech/pm2))。

## 开发

- 安装依赖 `yarn`
- 运行 `node index`

## 相关

- [ncuwlan](https://github.com/maoyuqing/ncuwlan)
