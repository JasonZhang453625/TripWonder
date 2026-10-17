# 正式游戏的球面照片接入流程

## 本次实现范围

`immersive-viewer-src.js` 替换正式探索页旧的圆柱投影，保留 `ImmersivePhotoViewer` 的生命周期接口。矩形原图贴到有限球面内壁，视点固定在球心，只转头和改变视场角，不平移、不估计深度、不生成照片外景物。场景切换、原图缓存、线索对话框、答题返回和照片锚定留言沿用正式游戏流程。独立纯图片 demo 仍在 `demos/immersive-photo/`。

社区投稿已按下列契约接入：静态网页与 App 使用 IndexedDB 保存照片与草稿，通过本机审核后发布；运行 `node admin/server.mjs` 时实际上传至 `/api/uploads`，用户原题与答案经后台审核后进入社区。审核通过的数据库 UGC 会在网站和 Android 构建时导出至 `published-journeys.js` 并打包媒体；审核状态变化后需要重新构建和发布。生产账号、共享数据库、远程媒体存储及审核权限不在当前原型范围。SphereX 在这里指球幕式视觉模拟，不是 CGV 的官方实现或一种需要另存的图片文件格式。

## 上传模块接入契约

上传完成，服务端返回可访问的原图地址，将它登记到场景的 `photo` 对象即可：

```js
scene.photo = {
  id: scene.id,                     // 稳定且唯一，已有产品使用与场景相同的 ID
  src: '/uploads/landscape.jpg',    // 全尺寸、方向正确的展示源图
  version: 'content-sha256',        // 内容变动时也要变化，用于 URL/缓存更新
  width: 6000, height: 4000         // 目录/封面需要的尺寸，查看器仍以解码后的真实尺寸为准
};
```

若有 `original.src`，查看器优先使用它；`sourceSha256` 优先于 `version`。`window.resolveImmersiveScene(photo, existingConfig)` 自动生成球面场景配置；无需修改 `immersive-scenes.js`，无需生成深度图、预处理球面位图或内嵌 JS。原有场景继续使用已有配置，以保留 HTTP 版本化资源和 file:// 内嵌预览。

后端还应保留项目现有照片来源、许可、缩略图和目录元数据约定。HTTP 原图需允许同源读取或正确的 CORS；新图必须以浏览器支持的格式返回。EXIF 方向以浏览器解码结果为准，上传后台可统一方向但不应覆盖来源原片。不要将缩略图误当作 `src`。

未来后台可以复用此接口自行预览：

```js
const config = window.resolveImmersiveScene(photo);
const viewer = new window.ImmersivePhotoViewer(previewRoot, photo, config);
await viewer.ready;
// previewRoot 内需要一个 .photo-plane；纯图片预览不要添加 .hotspot。
// 切换、关闭或取消预览时调用 viewer.destroy()。
```

球面转换发生在展示时，不写回原图。后台上传与生成见 README 的“后台：目的地旅程库”。

## 不同比例的自适应

运行时读取原图实际宽高。水平覆盖最多 150°，垂直覆盖最多 100°，避免球极；根据图片和窗口比例计算默认视场角，超宽图自动缩小视场角。缩放范围 1–3 倍，转头极限保证视口四角始终位于原片内，不再镜像或模糊填补边缘。兼容原有竖图；横图不要求固定 4:3、3:2 或 16:9。合法横图比例均可计算参数，实际可解码像素和 GPU 纹理大小仍由设备决定。

大于设备纹理上限时等比缩绘 GPU 纹理，缓存和原文件不变。正常尺寸保留原生像素。画面静止时不持续渲染。正式游戏继续使用现有手机视口布局，在 390×780（高宽 18:9）和 360×720 下验收；不限制真实手机必须是某一种屏幕比例。

热点与留言共享 `sphere-projection.mjs` 的正逆变换：`sphereScreenAt()` 把照片点投到屏幕，`spherePhotoAt()` / `viewer.photoAt()` 把屏幕点还原到照片坐标。新增后台若需要标注线索，可直接使用这套坐标，不再复制旧圆柱算法。

## 构建与检查

根目录 Node 22+：

```sh
npm ci
npm run build:viewer
npm run build
npm test
```

查看器构建依赖 `three@0.180.0`、`esbuild@0.25.12`，已经固定在根目录锁文件；无需原作者个人电脑上的试验目录。构建脚本同时更新查看器、应用、场景配置与留言脚本的页面版本。

启动静态服务器后进行正式游戏浏览器回归：

```sh
python3 -m http.server 8766 --bind 127.0.0.1
# 另开终端；Playwright 需在本机可用
node check-sphere-game.cjs
```

可用 `PLAYWRIGHT_PATH` 指定 Playwright 模块目录，`BROWSER_PATH` 指定浏览器可执行文件，`TRIPWONDER_URL` 指定预览服务地址；截图和结果默认写系统临时目录，或用 `TRIPWONDER_TEST_ARTIFACTS` 指定目录。

几何测试覆盖竖图兼容、近方形横图、4:3、3:2、16:9、2:1、21:9、4:1、8:1、32:1、多个视口比例与缩放档位，检查视野边界以及热点/留言坐标往返一致性。比例测试不是无限像素文件或全部手机硬件的性能保证。横图竖屏初始视野只显示一部分，侧看建筑仍会有球面投影形变。

## 本次验证记录

- `npm run build:viewer`、`npm run build`、`npm test` 通过（12 项球面几何/坐标测试、9 项移动更新与构建测试）。
- `check-sphere-game.cjs`：8 城 23 场景、全部线索点击、答题往返；未配置的 4096×1024 横图、触屏拖动、3 倍缩放、复位、留言定位和窄屏适配通过。
- `check-scene-transition.cjs`：慢加载保留旧图、预加载去重、失败重试、取消切换、减少动态效果及 file:// 内嵌预览通过。
- 同 ID 的版本化图片地址能够覆盖旧目录配置。源码与原图没有被图片投影操作写回修改。
- 验证环境为桌面 Chrome 模拟手机视口，尚未进行 Android/iOS 真机验收，未部署到正式网址。
