# milono Windows 到 Mac 项目交接说明

核验日期：2026-10-11，Asia/Shanghai。本说明用于迁移开发环境、保存完整历史，以及准备上传 GitHub 私密仓库。网站当前是主动暂停，不是需要自动修复的故障。迁移过程中不要恢复生产访问、重新部署或改动域名。

## 1 项目背景和当前版本

- 正式项目名为 MILONO；网站主页面按用户要求显示小写 `milono`。
- 定位：fluid cryptographic organism，强调 mutable form 与 persistent identity。
- 当前实现为优化版水熊虫研究控制台，不是最初的简单水熊虫页面，也不是后来的变形虫动画实验。
- 最新品牌图案为米白分节身体、陶土橙面部的水熊虫；黑底界面延续该配色。
- 所有 organism 遥测、证明结果和历史均为浏览器本地模拟。没有后端、真实链上 provider、钱包签名、生产 Ed25519/HKDF 或私钥托管。
- 顶部 CA 已显示 `8HzSYtmSxBPQqCDevZHWY5DJvKRB25Lvh7vYYoK2pump`。这是用户指定的公开展示文本，未独立核验链上合约，不是秘密，也不构成链上功能实现。

## 2 代码和未提交状态

迁移检查开始时：

| 项目 | 结果 |
| --- | --- |
| 本地分支 | `main` |
| 最新提交 | `07b7abc3ba34ee00f64795cc9c572fab8bd9b60d` |
| 最新变更 | 顶部展示新 CA |
| 前两次提交 | `329944c` 首页名称小写；`ff4951c` 主域名改为 milono.xyz |
| 已跟踪源码 | 没有未提交修改 |
| 未跟踪文件 | `NEW_MACHINE_SETUP.md`，内容已过时且包含本机路径 |
| origin | `https://github.com/theovarne/milono.git` |
| legacy-origin | `https://github.com/theovarne/MILNO.git`，保留，不替换 |

本次仅更新交接文档、旧新机说明入口及相关运行说明，不改应用代码。旧 `NEW_MACHINE_SETUP.md` 已备份到被忽略的 `qa/NEW_MACHINE_SETUP.pre-mac-migration.txt`；备份含本机路径，不应上传。

**远端尚未确认正常。** 本地缓存的 `origin/main` 指向上述提交，但本次联网执行 `git ls-remote --heads origin` 成功退出却未返回任何分支；未认证 GitHub 仓库 API 返回 404。这不能证明仓库已删除，也不能证明仓库已设为私密。必须登录正确 GitHub 账号确认仓库是否存在、是否为空、权限和可见性。不要据此清理本地历史或强制推送。

## 3 架构和必须迁移的文件

```text
dist/index.html
  ├─ assets/styles.css       布局、配色、响应式
  ├─ assets/organism.js      SimulationProvider、生命周期、存储、终端
  ├─ assets/visuals.js       Canvas 2D、节点/权重/历史检查
  └─ brand/                 Logo、图标、社交分享图
            │
            └─ localStorage 非秘密模拟状态
```

| 路径 | 用途及迁移要求 |
| --- | --- |
| `dist/` 全目录 | **可编辑源码，不是可删除的构建产物**；必须完整保留 |
| `dist/vercel.json` | CSP 等安全响应头；上线需要 |
| `dist/assets/amoeba.js`、`amoeba.svg` | 保留的变形虫实验，当前 HTML 不加载，不要误当线上主体 |
| `scripts/serve.mjs` | Node 本地静态服务，仅绑定回环地址 |
| `scripts/validate.mjs` | 文件、链接、品牌、敏感内容检查；build 不做打包 |
| `scripts/brand-assets.mjs` | 从现有品牌母版生成图标和 OG 图；首次运行不需要执行 |
| `package.json`、`package-lock.json` | Node 版本约束与锁定依赖，必须同时迁移 |
| `playwright.config.mjs`、`tests/` | 浏览器回归测试 |
| `.github/`、`.gitleaks.toml`、`.gitignore` | CI、密钥扫描规则和忽略规则，必须带上隐藏文件 |
| 根目录文档、`docs/`、LICENSE | 架构、协议、交互、限制、截图、MIT 授权及第三方说明 |
| `.openai/hosting.json` | 历史 hosting 元数据，不是当前 Vercel 生产部署入口 |
| Git 历史 bundle | 避免远端异常时丢失本地提交；和源码快照分别保留 |

没有 `src/`、`public/`、Next.js、Vite 或数据库服务需要额外搭建。唯一 npm 开发依赖是 Playwright 测试包。图片运行时已在 `dist/brand/` 内，不依赖微信缓存或临时附件路径。

## 4 Mac 安装与启动

安装 Git、Node.js 和 npm。建议 Node.js 24；本次 Windows 验证环境为 Node 24.17.0、npm 11.13.0，CI 使用 Node 22，package 声明最低 20.11。不要把 Windows 的 `node_modules` 复制到 Mac。

在恢复后的项目目录执行：

```bash
node --version
npm --version
git status --short --branch
npm ci
npm run build
npm run dev
```

访问 `http://localhost:4173`，退出用 Ctrl+C。没有 `.env` 也可以正常运行。端口冲突时：

```bash
MILONO_PORT=4175 npm run dev
```

Mac 首次测试安装适合本机架构的 Chromium：

```bash
npx playwright install chromium
npm test
```

测试自动使用端口 4184。默认不需要 `MILONO_CHROME`；如旧终端环境带入了 Windows 浏览器路径或远程测试地址，先清除：

```bash
unset MILONO_CHROME MILONO_TEST_URL
```

| 变量 | 用途 | 默认值 |
| --- | --- | --- |
| `MILONO_PORT` | 本地预览端口，优先于 PORT | 4173 |
| `PORT` | 预览端口备用变量 | 4173 |
| `MILONO_CHROME` | 可选浏览器可执行文件路径 | Playwright 自带 Chromium |
| `MILONO_TEST_URL` | 指定远程测试站点；暂停时不要设置成正式域名 | 本地 4184 |

这些是进程环境变量，程序不自动加载 dotenv。旧说明中的 `AMEBA_PORT` 等不是当前变量。运行时 JS 全局是 `window.Milono`，不要因为页面显示小写而改名。

## 5 需要单独迁移的内容和凭据

| 内容 | 当前情况 | 安全迁移方式 |
| --- | --- | --- |
| 应用 API key、RPC、数据库密码 | 项目内未发现，当前运行不需要 | 不必创建或提供 |
| 数据库、SQL/SQLite 文件、服务端上传目录 | 项目内未发现，架构没有数据库 | 无数据库导出任务 |
| 钱包私钥、助记词、发币账户 | 网站运行不使用，本次不查找外部钱包 | 如另有发币钱包，通过钱包官方恢复流程单独处理；绝不放 Git |
| GitHub 认证 | 旧机凭据管理器可能已有授权；不属于项目源码 | Mac 重新登录 GitHub 或配置新 SSH key；不要复制整个系统凭据库 |
| Vercel 认证 | 旧机 CLI 已授权 | Mac 用原账号重新 `vercel login`；不要上传 CLI auth 文件或 token |
| Vercel 项目绑定 | 忽略的 `dist/.vercel/project.json`，包含项目和团队 ID，不是 token | 建议重新连接**已有项目**；不要直接创建项目 |
| Dynadot 和域名账户 | 外部服务账户，项目内无登录材料 | 密码管理器安全同步账号及 2FA 恢复码；不要放仓库 |
| 浏览器模拟状态 | `milono.simulation.v2`，兼容 `milno.simulation.v2` / `ameba.simulation.v2` | 如需保留，按站点源单独导出该键的 JSON；在 Mac 对应站点源恢复。不是必要启动数据 |
| 原始参考图、设计源稿、提示词 | 运行图标已入库；外部源稿不保证在仓库内 | 需要继续设计时另用私密文件夹传输，勿依赖微信缓存/Temp |
| `qa/` 旧截图、检查脚本、旧说明备份 | 本地可选资料，Git 忽略，可能含本机路径 | 按需单独传，不作为发布源码 |

localStorage 按源隔离：localhost 不同端口、apex、www 和旧域名之间不会自动同步。暂停生产不会删除浏览器数据；新 Mac 新浏览器也不会自动拥有这些状态。不要为迁移状态临时开放网站。

无需迁移的缓存：`node_modules/`、Playwright 下载的 Windows 浏览器、`qa/test-results/`、构建缓存、日志。不要把全盘、用户主目录或整份浏览器配置上传到私密仓库。

## 6 部署位置和暂停状态

| 项目 | 当前值 |
| --- | --- |
| 正式域名 / canonical | `https://milono.xyz/` |
| 已知同项目别名 | `www.milono.xyz`；迁移期保留 `www.ameba.life` |
| Vercel scope | `zs2`，显示 Owner 为 Zjj |
| Vercel 项目名称 | `milno-restored`，历史名称，不要因品牌改名另建项目 |
| Project ID | `prj_doRRorxFzjH1BVO6Htk42WFFcyZo` |
| Team ID | `team_izJxagiCnDIAJTGqGUp2SE9X` |
| CLI 部署目录 | 项目内 `dist/` |
| 最近发布 | `dpl_GUwQzpw5yi8Q6ahvdQXSySsyZgLu`，对应 CA 更新 |
| 发布 URL | `https://milno-restored-g7977ie0c-zs2.vercel.app` |
| 当前状态 | 用户主动暂停；2026-10-11 实测 apex 返回 HTTP 503 / DEPLOYMENT_PAUSED |

暂停通过 Vercel 项目 `pause` API 完成，**不是代码维护页，也不是 DNS 删除**。它不是 Git 提交的一部分，克隆仓库不能得知或改变暂停状态。当前 CI 只检查构建、测试和敏感信息，不部署。

新 Mac 如只做开发，无需登录 Vercel。将来获准发布时，先安装已使用的 CLI 版本并连接现有项目：

```bash
npm install -g vercel@54.14.2
vercel login
cd dist
vercel link --project milno-restored --scope zs2
vercel project inspect --non-interactive --scope zs2
```

确认 Project ID 和 Team ID 与上表一致，不匹配立即停止。**本次不执行部署或恢复。** 只有用户明确要求重新开放后，才可使用以下恢复操作：

```bash
vercel api /v1/projects/prj_doRRorxFzjH1BVO6Htk42WFFcyZo/unpause -X POST --scope zs2
```

恢复后核验网站、新 CA、域名 TLS 和移动端。后续发布命令为 `vercel --prod --scope zs2`，必须从 `dist/` 执行且另行获得发布授权。

DNS 历史配置：Dynadot；根域 A 为 `216.150.1.1`，www CNAME 为 `6ad1f6f9e3b67353.vercel-dns-017.com`，TTL 5 分钟。本次仅核验正式域名暂停响应，未重新审计全部 DNS。迁移电脑不需要改 DNS。

## 7 私密仓库上传准备

私密仓库也不能保存密钥。当前 `.gitignore` 已排除环境文件、常见私钥/证书、凭据 JSON、node_modules、Vercel 绑定与 QA 文件。没有查到项目内实际 `.env`、私钥证书或数据库文件；不代表用户电脑其他位置不存在凭据。

本次 Gitleaks 扫描工作目录与本地全部 30 个提交未发现泄露；关键词命中主要是模拟、协议及安全说明。扫描不能证明绝无秘密，额外导入文件仍要复查。历史 `17d4516` 含个人作者邮箱，用户此前已同意保留历史；历史已公开的信息不会因为新仓库私密而撤回。

建议上传白名单：所有原跟踪文件 + 本次更新的 `README.md`、`docs/development.md`、`NEW_MACHINE_SETUP.md` 和新增 `MAC_HANDOFF.md`。不要上传迁移 zip/bundle、本机旧说明备份或登录凭据。迁移包可以直接用于还原，但不应作为压缩附件提交到源码仓库。

本次不创建仓库、不改 origin、不改可见性、不执行 push。先在 GitHub 确认目标仓库确实为 Private，尽量使用空仓库；若目标已有提交，先核对历史，禁止用强制推送覆盖。

从恢复了历史的本地仓库操作，以下命令需将示例地址替换为已确认的私密仓库地址后再执行：

```bash
git status --short --branch
git diff --check
npm run build
npm test
git add README.md docs/development.md NEW_MACHINE_SETUP.md MAC_HANDOFF.md
git diff --cached --stat
gitleaks git . --staged --redact
gitleaks git . --log-opts="--all" --redact
git commit -m "Document Mac migration and current operational state"
git remote add migration-private https://github.com/OWNER/PRIVATE_REPO.git
git ls-remote --heads migration-private
git push -u migration-private main
```

保留原 origin 和 legacy-origin；如果目标就是现有 origin，不另加同地址 remote，先解决其访问/空分支状态。不要执行 `push --mirror` 或 `--force`。`package.json` 的 `private: true` 只禁止 npm 发布，不代表 GitHub 仓库私密。

## 8 迁移包的使用

本次迁移材料位于本机被忽略的 `qa/mac-migration-20261011/`：

- `milono-source-20261011.zip`：源码、资产、配置和本次最新交接文档，不含 `.git`、依赖、凭据或 QA。
- `milono-history-20261011.bundle`：原有 Git 历史与引用，HEAD 为 `07b7abc`；本次尚未提交的文档不在 bundle，必须与源码 zip 一起携带。
- `SHA256SUMS.txt`：传输完整性校验。

将这三个文件通过安全方式传到 Mac 同一目录，执行：

```bash
shasum -a 256 -c SHA256SUMS.txt
git clone -b main milono-history-20261011.bundle milono
unzip -o milono-source-20261011.zip -d milono
cd milono
git status --short --branch
```

zip 内是项目根目录内容，无额外顶层目录。覆盖的是同一 HEAD 的快照与本次文档，不适合对已有其他未保存修改的目录使用。bundle 克隆后的 origin 指向本地 bundle，不是 GitHub；核对后可把它重命名为 `migration-bundle`，再显式添加上文记录的 origin / legacy-origin 或新的私密 remote。不要盲目推送到 bundle 路径。

源码包以 Git 提交中的文件为基底叠加本次四份文档，新增文档使用 LF 换行，避免把 Windows CRLF 差异带到 Mac 后造成全仓库伪修改。恢复后预期只有 README、development 两份文档修改及两份新增说明，应用源码不应出现差异。

如果仅解压源码 zip，也可以启动项目，但没有 Git 历史。不要先 git init 再声称保留了历史。原机在 Mac 验收成功前不要清理。

## 9 已知问题和待办

1. **优先核实 GitHub 目标与权限**：远端无分支、公开 API 404 的原因未确定；本地 bundle 是必要保险。
2. **生产有意暂停**：不可把 503 当故障自动恢复；新 CA 已在最近生产构建中。
3. **Mac 尚未实际验收**：当前测试在 Windows/Chrome 完成，不能替代 Apple Silicon/Intel Mac 首次 npm ci 和 Chromium 测试。
4. **截图有轻微时差**：README 截图早于首页小写和新 CA 更新；如需完全一致，应在允许的本地环境重新截图，不为截图开放生产。
5. **品牌大小写范围**：首页小写；文档、manifest 和社交图片仍有 MILONO，这是之前仅修改主页的范围，不是继续改所有资产的授权。
6. **历史实验勿误启用**：amoeba/interaction 旧测试未纳入默认测试；当前默认三套测试共 22 项。
7. **文档旧值已修正**：旧新机说明 AMEBA 变量和本机路径会误导迁移并导致 build 失败，本次替换为新入口并保留本地备份；development 中 CA TBA 已更新。
8. **不承诺链上能力**：真正的签名、证明、链 provider、持久数据库和密钥托管均属独立未来工程，不是迁移时补齐的依赖。

## 10 本次检查与交接边界

- 检查 package、锁文件、静态源码、图片资源、脚本、CI、Git 状态、remote、本地历史及忽略目录中的敏感文件名。
- 迁移前本地 22 项浏览器测试通过；修正文档后 `npm run build` 通过（54 项必需文件检查）。迁移包已通过完整 bundle 验证、独立恢复后的 build、必需隐藏文件检查和 SHA-256 校验。
- 保留用户原文件备份；未清理历史、未变更 remote、未访问系统凭据内容、未恢复生产、未部署、未提交或推送本次文档。
- 接手者完成 Mac 安装、build、22 项测试与私密仓库可见性确认后，方可认为迁移完成。
