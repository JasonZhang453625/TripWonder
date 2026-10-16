# 发布到 Vercel

当前项目是私有 GitHub 仓库，Vercel 团队使用 Hobby 套餐。Vercel 检查部署提交的作者，必须是关联的项目所有者 `JasonZhang453625`。由所有者点击 squash 合并，并不会把 squash 提交作者改成所有者；协作者仍是作者，因此会被阻止部署。

## 日常发布

1. 协作者使用自己的身份在功能分支提交，创建面向 `main` 的 PR。
2. 等待 GitHub 的 **Build and test** 通过，完成代码与界面验收。它独立运行完整构建、球面测试、数据库测试和移动更新测试，不依赖 Vercel 是否允许协作者预览。
3. 所有者在已登录 GitHub CLI 的终端执行：

   ```sh
   npm run release:merge -- 123 --check
   npm run release:merge -- 123
   ```

   将 `123` 替换成实际 PR 编号。脚本校验登录账号、PR 目标、冲突、当前提交检查，并锁定已检查的 head SHA；只允许 Vercel 明确的作者权限阻塞，不忽略实际构建失败。它使用 merge commit 并验证合并提交作者，不会改写协作者署名，也不会删除分支。
4. 如果用 GitHub 网页操作，由所有者选择 **Create a merge commit**。协作者 PR 不使用 **Squash and merge** 或 **Rebase and merge**。同样须检查合并提交作者及生产状态。
5. 等待 `main` 的 Vercel 部署显示 **Ready**；再检查 <https://tripwonder.vercel.app> 的首页、进入探索、照片加载与返回。确认网页引用的脚本版本对应本次提交。
6. 根据 `mobile/build-report.json` 的 `runtime` 检查 `/mobile-updates/<runtime>.json`，核对 bundle ID、清单和文件校验和。安卓页面更新仍需完整关闭应用后重新打开；原生插件和权限变化需要新 APK。

Vercel 的 `buildCommand` 统一为 `npm run build`，由根脚本安装 backend 和 mobile 依赖并生成网站及 OTA 产物。配置 `DATABASE_URL` 后才从云数据库导出网页目录；没有配置时继续使用已入库的静态材料。不要为修复部署而填入假连接串或把本地数据库目录上传。

## 套餐边界与排查

- Hobby 私有仓库的协作者分支预览仍受平台限制。GitHub CI 通过证明构建与自动测试通过，不代表浏览器验收或部署完成。需要协作者各自的 Vercel 预览时，另行评估团队套餐与权限；本流程不升级套餐或增加成员。
- 出现 `Git author ... must have access to the project` 或 `Deployment was blocked`，先检查合并提交作者和所用合并方式。旧的已阻塞部署记录不会变成 Ready；以最新合并提交对应的生产部署为准。
- 检查失败是 npm、构建脚本或数据库连接错误时，查看日志修复实际错误，不用重写作者信息掩盖问题。

官方说明：[Vercel Git 部署权限](https://vercel.com/docs/git)、[协作限制](https://vercel.com/docs/deployments/troubleshoot-project-collaboration)、[GitHub 合并方式](https://docs.github.com/en/pull-requests/reference/pull-request-merges)。
