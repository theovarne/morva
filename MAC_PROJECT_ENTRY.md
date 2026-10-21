# MORVA — Mac 项目入口

## 最新状态（2026-10-22）

项目现名为 **MORVA**，标语为 **Form changes. Identity remains.**。新 Logo 使用用户提供的米白与陶土橙角色：双触角、双大眼、分节身躯；旧 CA 地址已清空。当前运行仍为浏览器本地模拟。`MILONO_*` 环境变量、`window.Milono` 和 `milono.simulation.v2` 存储键继续兼容；本机统一本地启动 ID 仍为 `milono`。

以下迁移记录及 [MAC_HANDOFF.md](MAC_HANDOFF.md) 保留历史状态，不能据此判断当前线上暂停或部署状态。

这是从 Windows 当前工作目录整理的源码快照，包含未提交的项目文件。

## 目录

- `.`：Current main website source.

## 交接与启动说明

- [MAC_HANDOFF.md](MAC_HANDOFF.md)
- [NEW_MACHINE_SETUP.md](NEW_MACHINE_SETUP.md)
- [docs/brand-migration.md](docs/brand-migration.md)
- [qa/NEW_MACHINE_SETUP.pre-mac-migration.txt](qa/NEW_MACHINE_SETUP.pre-mac-migration.txt)
- [qa/mac-migration-20261011/SHA256SUMS.txt](qa/mac-migration-20261011/SHA256SUMS.txt)

Mac 克隆后，进入上述项目目录，按照对应说明安装依赖并启动。实际密钥、数据库、浏览器存档和原 Git 历史应通过单独备份迁移。

本次上传只保存源码与说明；未执行线上部署、链上交易或生产数据库写入。
