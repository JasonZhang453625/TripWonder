# TripWonder 携程 · 奇境挑战：协作与 AI 开发规范

本文件是本仓库协作者和 AI 助手的项目工作规范。开始工作前先读完本文件，并遵循当前对话中用户的具体要求。其他 AI 工具入口文件会引导对应工具读取本文件；修改规范时请保持这些入口有效。

## 项目身份

- 项目名称统一写作 **TripWonder 携程 · 奇境挑战**；英文短名可用 TripWonder。
- GitHub 仓库：`JasonZhang453625/TripWonder`。仓库为私有仓库，协作者须由仓库所有者邀请并接受邀请后访问。
- 正式网页：<https://tripwonder.vercel.app>。旧地址会跳转到新地址；代码、分享链接和安卓更新配置优先使用新地址。
- 产品现状和本地运行方式以根目录 `README.md`、`mobile/README.md` 及实际代码为准。产品文档和历史说明可能包含尚未实现的计划，不能把计划描述成已上线功能。

## 必须使用分支和 Pull Request

除非仓库所有者在当前任务中明确要求直接提交主分支，否则禁止在 `main` 上开发、提交或推送。每个功能、缺陷修复或独立文档改动使用一个短期分支。

### 协作者工作流

团队成员均以 GitHub 仓库协作者身份参与。首次参与时，先确认已接受仓库邀请，然后直接克隆上游仓库；无需 fork：

```bash
git clone https://github.com/JasonZhang453625/TripWonder.git
cd TripWonder
git switch -c feat/简短主题
```

每次开始新任务时，先同步 `origin/main`，再从最新主分支创建独立工作分支：

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c fix/简短主题
```

完成后只暂存本任务相关文件，提交并推送到上游仓库的个人工作分支：

```bash
git status
git add <本任务相关文件>
git commit -m "feat: 简述改动"
git push -u origin feat/简短主题
```

随后建立 Pull Request：base 为 `JasonZhang453625/TripWonder:main`，compare 为刚推送的工作分支。说明改动内容、验证方式、已知限制及关联 Issue。不要直接推送 `main`。

## Pull Request 与合并

- 当前私有仓库使用 Vercel Hobby：生产发布必须由 `JasonZhang453625` 账号使用 **Create a merge commit** 合并到 `main`，优先运行 `npm run release:merge -- <PR编号>`。不要对协作者 PR 使用 squash 或 rebase 合并；squash 会将协作者设为新提交作者，导致生产部署被 Vercel 拦截。merge commit 保留协作者的原始提交与署名。
- 合并前确认 GitHub 的 `Build and test` 检查通过。协作者分支的 Vercel 预览可能因 Hobby 作者权限被阻止；这不等于构建通过，不能替代 GitHub CI。发布后继续核对生产部署 Ready、网页与安卓更新 feed，流程见 `docs/releasing.md`。
- 一项 PR 聚焦一项可以独立审查的工作；尽量小步提交，避免多人长时间并行修改同一文件。
- PR 描述应写清楚：目的、主要改动、运行过的检查、截图或录屏（涉及界面时）以及未完成项。
- 如果改动关联现存 Issue，在 PR 正文加入 `Closes #编号`。
- 仓库所有者或指定审查者检查差异、验证结果和产品边界后合并。贡献者不要自行合并自己的 PR，除非所有者明确授权。
- 合并后可删除已合并的远端功能分支；不要删除仍在使用或尚未合并的分支。

## AI 助手的工作方式

1. 开始前查看当前分支、工作区状态、相关文件和最近改动。明确区分本任务已有修改与其他人的未提交修改。
2. 保留无关的本地修改；不要重置、覆盖、批量格式化或提交别人的工作。提交时只暂存本任务明确修改的文件，不要习惯性执行 `git add .`。
3. 先阅读与任务相关的 README、代码和产品说明。以当前代码和最新产品约定判断实现状态，不凭旧文档臆测功能。
4. 

## 避免冲突和保护项目

- 开工前同步最新 `main`，使用描述清晰的独立分支，例如 `feat/map-api`、`fix/android-share`、`docs/collaboration-guide`。
- 开始大型改动前，在团队协作渠道说明负责范围；避免并行编辑相同的入口文件、全局样式、依赖清单和发布配置。
- 发生冲突时先理解两边改动目的并保留双方有效内容。不要用整文件覆盖解决冲突，不要对共享分支强制推送。
- 不提交 `.env`、签名密钥、令牌、个人数据、构建产物和依赖目录。安卓签名私钥由发布负责人单独保管。
- 新增或替换图片、音频、字体和地图数据时，核对来源、许可和署名要求，并更新相应素材说明。
- 不因本地构建、PR 合并或部署排队就宣称已发布；只有实际部署状态和目标地址核验成功后，才报告线上可用。
- 变更仓库可见性、团队成员、协作者权限、GitHub/Vercel 设置、正式域名或线上数据前，必须获得仓库所有者对该项具体变更的明确授权。

## 常用检查

根目录脚本：

```bash
npm test
npm run build
```

安卓相关修改可在 `mobile/` 中按 `mobile/README.md` 的说明构建与检查。先确认工具链和运行时，再选择与改动相关的命令；普通文档修改无需运行项目构建。
