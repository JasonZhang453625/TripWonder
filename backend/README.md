# 目的地 Journey 数据库

数据按 `目的地 ID → journey` 保存，一个目的地只有一份 journey。使用现有稳定英文 ID（如 `suzhou`）作为 key，中文目的地名保存在 `journey.name`。

数据库表 `destination_journeys` 只有两列：`destination_id`（主键）和 `journey`（PostgreSQL JSONB）。主键保证一对一关系，journey 中包含该目的地的图片场景、热点讲解、问题、选项、正确答案及解析。现有目的地坐标、英文内容及路线站点也原样保留，不加入游戏规则、内容版本或发布状态。

```js
{
  suzhou: {
    id: 'suzhou', name: '苏州', region: '江苏', lat: 31.324, lng: 120.624,
    scenes: [{
      id: 'suzhou-huqiu', name: '虎丘云岩寺塔',
      photo: {
        original: {src: 'photo-library/suzhou/huqiu/original.jpg', width: 4032, height: 3024},
        displaySource: {src: 'photo-library/suzhou/huqiu/oriented.jpg', width: 3024, height: 4032},
        sphere: {projection: 'sphere'}
        // 实际数据还保留 sourceSha256、缩略图、来源及许可等字段。
      },
      hotspots: [/* {x, y, title, text, ...}，坐标为原片百分比 */]
    }],
    questions: [/* {q, options, answer, explain, sceneId, ...} */],
    stops: [/* 现有路线站点 */]
  }
}
```

## 本地建库和导入

在仓库根目录使用 Node.js 22+：

```sh
npm ci --prefix backend
npm run --prefix backend db:init -- --local
npm run --prefix backend db:seed -- --local
npm run --prefix backend db:get -- suzhou --local
npm test --prefix backend
```

`--local` 使用 PGlite（本地嵌入式 PostgreSQL），文件保存在 `backend/.local/journeys/`，已从 Git 排除。关闭进程再打开仍可读取。它只供本地开发验证，不能用 Vercel 函数的临时文件系统承载线上数据库。

导入器复用页面实际加载的 `data.js`、`content/*.js`、`media-manifest.js` 和 `catalog.js`，再合并各场景的 `photo.json`；不手工复制维护第二套内容。首次导入八城、23 场景、24 道题。再次导入只补齐缺少的目的地，不覆盖数据库中已编辑的 journey。导入前先校验全部内容，写入使用单条原子 SQL。

数据库中的记录与旧静态文件不会双向自动同步。合并后的游戏通过 `catalog.mjs` 将 journey 适配成原游戏目录与 SphereX 照片输入；本地数据库预览和 Vercel 构建导出共用这套适配。

## Vercel 上的持久化数据库

线上适配 Vercel Marketplace 的 **Neon PostgreSQL**。使用官方 `@neondatabase/serverless` HTTP 驱动，无需在 Vercel 实例中启动数据库服务器或保留磁盘文件。官方接入说明：[Vercel Postgres](https://vercel.com/docs/postgres)、[Neon 驱动](https://neon.com/docs/serverless/serverless-driver)。

在 Vercel 项目中连接 Neon 后，将连接字符串配置为服务端环境变量 `DATABASE_URL`。不要使用公开前缀、写入前端代码或提交真实 `.env`。这里仅提供 `.env.example`；本次未创建云资源、修改 Vercel 设置或操作线上数据。

针对新建的开发数据库，在 `backend/` 的本地 `.env` 配置连接字符串，再从仓库根目录执行一次：

```sh
node --env-file=backend/.env backend/scripts/database.mjs init
node --env-file=backend/.env backend/scripts/database.mjs seed
node --env-file=backend/.env backend/scripts/database.mjs get suzhou
```

初始化和导入不放进网站构建步骤。根目录 `npm run build` 安装后台依赖；配置 `DATABASE_URL` 时，`mobile/scripts/hosting.cjs` 从数据库读取 journey，导出网站使用的 `catalog.js`，已有游戏入口随即使用数据库照片、热点和题目。未配置时沿用原静态目录；已配置但无法连接、未建表或没有材料时构建失败，不悄悄使用旧数据。

Vercel 网站采用静态 Build Output，因此数据库变更需要重新构建网站后才能展示。本次没有新增公开数据库写接口。Android 更新包继续使用原静态目录，没有宣称移动端实时同步数据库。导出的游戏目录与现有静态题库一样包含客户端计分所需答案，数据库连接字符串始终只在构建端使用。

## 服务端读写

```js
import {connectDatabase} from './backend/database.mjs';

const connection = await connectDatabase(); // 从服务端环境读取 DATABASE_URL
try {
  const journey = await connection.database.get('suzhou'); // 不存在返回 null
  const dictionary = await connection.database.dictionary();
  // 在受信任的后台中编辑完整 journey，然后保存；会替换该目的地的整份文档。
  await connection.database.save('suzhou', journey);
} finally {
  await connection.close();
}
```

`save()` 校验目的地对应关系、场景 ID 唯一性、图片资源、热点坐标、正确答案和题目所属场景。SQL 使用参数绑定。数据库存取模块只能由服务端或受信任的本地管理脚本调用，不打包连接驱动或凭据给玩家。游戏目录导出仍沿用现有客户端答题和计分方式。

## 图片与 SphereX 的对接

数据库保存文件引用，图片字节保留在原有 `photo-library/` 或后续对象存储；新上传文件使用 HTTPS 地址。此 PR 不迁移图片字节，也未实现上传 HTTP 接口或开通对象存储。

- `photo.original`：未经修改的来源原片、尺寸等资料。
- `photo.displaySource`：适合展示的源图；通常与原图相同，虎丘使用已转正副本。
- `photo.thumb/screen/detail`：现有展示版本。
- `photo.sphere.projection`：`sphere`，对应另一 worktree 的实时球面查看器。
- `photo.sphere.asset`：可选；以后确实生成独立转换文件时，在这里登记 `{src, width, height, sha256}`。当前没有生成此文件，不虚构转换产物。

使用 `toSpherePhoto()` 为另一 worktree 的查看器生成兼容输入；它优先选独立球面资源，其次展示源图，保留数据库里的真正原片：

```js
import {toSpherePhoto} from './backend/journey.mjs';
const photo = toSpherePhoto(journey.scenes[0].photo);
// 将 photo 交给已有的 window.resolveImmersiveScene(photo) 和 ImmersivePhotoViewer。
```

当前 SphereX 效果在浏览器里实时投影原图，不需要预先转换一张图片。相同画面文件更新时，应同步更新对应文件的 SHA-256，供查看器更新缓存；这是文件内容哈希，不是 journey 内容版本。

## 验证范围

测试使用实际 PGlite PostgreSQL 引擎执行建表及 JSONB 查询，覆盖八城内容完整读写、唯一目的地、编辑保存、重复导入不覆盖、无效答案和跨场景关联、原子导入、数据库关闭重开、虎丘转正图片选择，以及游戏目录生成。浏览器联调与八城回归见下文。未验证云端 Neon 连接，未部署线上数据库。

## 数据库 → SphereX 实际联调

```sh
npm ci
npm run build:viewer
npm run build
npm test
npm run --prefix backend db:init -- --local
npm run --prefix backend db:seed -- --local
npm run --prefix backend preview -- --local
```

打开 `http://127.0.0.1:8770/`，从原游戏入口进入探索。预览服务在请求 `catalog.js` 时读取实际数据库，其余资源使用项目现有文件；刷新页面即可检查数据库编辑后的材料。它只监听本机回环地址，不开放数据库文件或凭据。`--local` 必须显式指定；云数据库用 `DATABASE_URL`。

使用实际浏览器验证数据库图片替换、SphereX、题目变化与答题返回：

```sh
# 需要本机 Chrome 和 Playwright；模块不在默认路径时设置 PLAYWRIGHT_PATH。
npm run --prefix backend test:integration
# 上面的预览服务运行期间，回归数据库中的八城全部照片：
TRIPWONDER_URL=http://127.0.0.1:8770/ node check-sphere-game.cjs
```

联调使用已有天子山、北京和上海照片，不生成新图片。测试通过真实数据库保存图片资源与问题，在正式页面检查球面渲染、拖动、缩放、题目、答题返回，以及同一场景 ID 更换图片后的缓存更新。截图默认输出系统临时目录 `tripwonder-journey-sphere/`。

验证本地数据库导出的 Vercel 静态产物：

```sh
TRIPWONDER_LOCAL_DATABASE=1 npm run --prefix mobile build:hosting
python3 -m http.server 8771 --bind 127.0.0.1 --directory .vercel/output/static
```

浏览器打开 `http://127.0.0.1:8771/`。`TRIPWONDER_LOCAL_DATABASE` 仅供本地构建验证，Vercel 使用 `DATABASE_URL`；无需也不应把 `.local` 数据目录上传部署。
