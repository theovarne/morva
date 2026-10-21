# MORVA 新机器使用说明

更新日期：2026-10-22，Asia/Shanghai。历史迁移背景、架构、Git 状态、安全清单、私密仓库准备和部署位置见 [Windows 到 Mac 交接说明](MAC_HANDOFF.md)。

## Mac 快速启动

安装 Node.js 24 和 Git，在项目根目录执行：

```bash
npm ci
npm run build
npm run dev
```

打开 `http://localhost:4173`。停止用 Ctrl+C。静态可编辑源码就在 `dist/`，必须保留；不要迁移 Windows 的 node_modules。

## 浏览器测试

```bash
unset MILONO_CHROME MILONO_TEST_URL
npx playwright install chromium
npm test
```

测试自动使用本地 4184 端口。当前变量名为 `MILONO_PORT`、`PORT`、`MILONO_CHROME`、`MILONO_TEST_URL`，不是旧 AMEBA 变量。没有应用密钥或数据库启动要求。

## 当前状态

当前品牌为 **MORVA**，首页显示小写 `morva`，标语为 **Form changes. Identity remains.**。Logo 为用户提供的米白与陶土橙角色，具有双触角、双大眼和分节身躯；旧 CA 地址已清空。网站是浏览器本地模拟，数据存在 localStorage。兼容入口 `window.Milono`、`MILONO_*` 环境变量及 `milono.simulation.v2` 存储键保留；本机统一本地启动 ID 仍为 `milono`。

`MAC_HANDOFF.md` 记录的是 2026-10-11 的迁移状态，其中暂停信息不代表当前线上状态。开发和测试无需重新部署网站。

更换机器前先保存源码和 Git 历史，并核对目标私密仓库权限。历史迁移时遇到的远端访问问题见交接说明；当前权限以实际登录后检查为准。

旧版本说明的完整备份位于被忽略的 `qa/NEW_MACHINE_SETUP.pre-mac-migration.txt`，包含旧机路径，仅供本机追溯，不应上传。
