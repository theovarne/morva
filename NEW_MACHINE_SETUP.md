# milono 新机器使用说明

更新日期：2026-10-11，Asia/Shanghai。完整背景、架构、Git 状态、安全清单、私密仓库准备和部署位置见 [Windows 到 Mac 交接说明](MAC_HANDOFF.md)。

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

当前为优化版水熊虫控制台，首页显示小写 milono，模拟数据存在浏览器 localStorage。线上 milono.xyz 已按用户要求暂停；迁移不应恢复或重新部署网站。

先保存本地源码快照和 Git 历史，再核对目标私密仓库权限。不要只依赖当前 origin 重新克隆：本次联网检查未返回远端分支，原因尚待确认。

旧版本说明的完整备份位于被忽略的 `qa/NEW_MACHINE_SETUP.pre-mac-migration.txt`，包含旧机路径，仅供本机追溯，不应上传。
