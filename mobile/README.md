# TripWonder 安卓应用与在线更新

实现采用 Capacitor 8 + `@capawesome/capacitor-live-update` 8。应用包名 `com.tripwonder.app`。网页继续通过 GitHub → Vercel 部署，安卓应用从本地文件启动，未设置远程 `server.url`。

## 构建与安装

环境：Node 22+、JDK 21、Android SDK 36。在本目录执行：

```powershell
npm ci
./scripts/build-android.ps1
```

测试 APK 位于 `artifacts/TripWonder-<versionName>-debug.apk`（版本号见 `release.json`）。签名发行包：

```powershell
node scripts/init-signing.cjs
./scripts/build-android.ps1 -Release
```

`init-signing.cjs` 要求设置 JAVA_HOME，首次生成证书，后续复用。私钥和密码保存在用户目录 `.tripwonder/signing/`，本机引用文件 `android/signing.properties` 被 Git 忽略。请备份整个私钥目录；丢失后无法用同一证书覆盖安装。Debug 与 Release 签名不同，不可直接互相覆盖。

本机工具安装于 `D:/Android/tripwonder-tools/`，构建脚本会检测。其他电脑设置 JAVA_HOME、ANDROID_HOME。Windows 的短目录套接字异常通过单次构建的 `jdk.net.unixdomain.tmpdir` 避开；可以用 TRIPWONDER_SOCKET_DIR 指定一个短的英文目录。不会修改系统代理或全局 Java 设置。

## Android 字体适配

1.0.1 将 WebView 文字缩放统一为 100%，在启动、回到前台和配置变更后重新确认，使原型按网页 CSS 字号显示。这个原型版本的网页文字不随 Android 系统字体大小额外放大；不修改手机的系统设置、显示密度或场景双指缩放。

`mobile.css` 设置 `text-size-adjust: 100%`，避免浏览器另行放大文字。首页的密集图标标签随真实手机视口宽度调整，桌面预览字号保持原样。该适配同时包含原生代码，旧 APK 需要安装新版；仅刷新网页或在线更新不能应用原生缩放设置。真机视觉效果仍需在目标 Android 设备确认。

## 场景资源

23 张 `immersive-blur/photo.jpg` 原样打包，不再压缩、缩小或转换。原始归档文件继续留在 photo-library，不重复塞入 APK。缩略图、封面和地图等运行资源一并保留。应用第一次安装后即可离线探索现有场景。文件加载消除了图片下载等待，图片解码和 GPU 绘制仍取决于设备能力。

`scripts/build.cjs` 从当前工作区的网页生成 `www/`，保留浏览器版本文件。打包产物和 `node_modules` 不进入 Git。`app.js` 只新增原生返回接口及正确的对外分享网址。

## GitHub → Vercel → App

`vercel.json` 新增构建命令，执行 `npm ci --prefix mobile` 和 `build:hosting`。脚本生成 Vercel Build Output API 文件：原网页、安卓资源清单、更新检查入口和带 SHA-256 校验头的逐文件下载入口。

应用可用后调用 `LiveUpdate.ready()`，再后台检查更新。只下载变化的文件，未变化的高清图由插件从已安装包复制。下载完整后安排下一次启动生效；不在探索或答题中强制刷新。无网、请求失败、磁盘不足时保留当前包。30 秒未报告页面就绪会触发插件回退到内置版本，问题包进入阻止列表。

每个更新绑定原生兼容标识，由原生源码、配置、依赖版本及 `release.json` 生成。修改插件、权限、原生代码需要发布新 APK；旧 APK 不会获得不兼容更新。网页界面、题目、场景可以走在线更新。每次普通 GitHub 提交经 Vercel 成功部署后即成为该兼容版本的更新；**仅本地构建并不代表已发布到线上**。

更新服务依赖现有 Vercel HTTPS 信任链和逐文件 SHA-256 校验，没有另购 Capawesome Cloud，也没有配置独立的 OTA 签名密钥。旧的内容地址在下次 Vercel 部署后可能失效；跨部署中的下载会失败并在下次检查重试，当前安装包不受影响。不同原生兼容版本并行维护时，应为旧版本保留独立更新频道/历史部署；当前原型只有一个发行频道。

## 验证

```powershell
npm test
node tests/browser-smoke.cjs
npm run build:hosting
```

自动测试覆盖更新去重、失败重试、已下载包复用、兼容标识、问题包跳过、撤回待安装更新；浏览器模拟原生桥检查返回、分享、高清文件哈希及资源缺失。浏览器测试需要 Playwright 和 Edge，可用 PLAYWRIGHT_PATH、BROWSER_PATH 指定本机路径。它不等同于安卓实机验收。

安装到安卓手机后应实测：首次离线启动、23 场景探索、后台切回、系统返回、分享图片、正常更新后重启、下载中断，以及故意损坏测试更新的回退。当前不会自动持久化挑战进度，保持原型重启后从首页开始的既有约定。

参考：[Capacitor](https://capacitorjs.com/docs)、[Live Update 插件](https://capawesome.io/docs/sdks/capacitor/live-update/)、[Vercel 输出配置](https://vercel.com/docs/build-output-api/configuration)。
