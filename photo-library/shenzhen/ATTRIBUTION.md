# 深圳场景照片来源与处理记录

照片由 2026-09-26 更新后的素材库提供；原图路径记录在各场景的 `photo.json` 中；每个场景目录保存按长边 640/1440/2400 像素生成的 `thumb.webp`、`screen.webp`、`detail.webp`，以及记录尺寸与哈希的 `photo.json`。沉浸查看使用 `immersive-blur/photo.jpg`（按原片像素尺寸构建，只用原片，画面外为运行时生成的模糊投影，不含 AI 内容）。

| 场景 | 摄影作者 | 原图页面 | 许可 | 本地文件 |
| --- | --- | --- | --- | --- |
| 福田中心区·平安金融中心 | lywin / Pexels | [来源页](https://www.pexels.com/photo/38833568/) | [Pexels License](https://www.pexels.com/license/) | `futian/original.jpg` 3000×2000（原文件未改动）；素材库来源 `photo-library/shenzhen/futian/original.jpg`，SHA-256 `f27f905d5680cd88…` |
| 深圳·城市夜色 | 用户提供 | 本地提供 | 未注明 | 原文件 `photo-library/shenzhen/houhai/original.png` 7002×4668（原文件未改动），SHA-256 `d7dc2681b3a04201…` |
| 前海·欢乐港湾 | ainc-t / Pexels | [来源页](https://www.pexels.com/photo/34947074/) | [Pexels License](https://www.pexels.com/license/) | `qianhai/original.jpg` 5019×3346（原文件未改动）；素材库来源 `photo-library/shenzhen/qianhai/original.jpg`，SHA-256 `3c38385a7837d006…` |

Pexels 许可允许免费使用与修改，不强制署名；这里仍保留摄影者与原图页面便于核对。Wikimedia Commons 照片按各自许可使用：CC BY-SA 要求署名并以相同许可分享衍生图，CC0 无署名要求。

## 讲解与题目的事实来源

“深圳·城市夜色”的三个线索及对应题目依据用户提供原图中的可见内容：高楼群、山脊与弯曲道路。点位按该原图重新标定，不认定具体拍摄地点、楼宇名称或高度；内部场景 ID `sz-houhai` 仅为兼容既有素材路径保留。

- http://www.sznews.com/news/content/2019-04/09/content_21610673.htm
- http://ifutian.sznews.com/content/2018-03/09/content_18638064.htm
- https://www.szns.gov.cn/mlns/whns/tycg/content/post_12589347.html
- https://www.sznews.com/content/mb/2021-04/22/content_24154597.htm
- http://www.sznews.com/news/content/2021-04/06/content_24108184.htm
- https://www.gov.cn/jrzg/2010-08/27/content_1689210.htm

各场景的讲解点、题目与行程站点另在 `content/shenzhen.js` 的 source 字段逐条标注。行程中的游览时长、坐标是原型规划参数，开放时间与预约以官方当日公告为准。
