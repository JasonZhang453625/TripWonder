# 深圳场景照片来源与处理记录

2026-10-17 将福田场景换为 4608×3072 的原生横图（Chris / Wikimedia Commons），按新白天画面重写观察题与讲解，不再描述旧夜景车流。其余合格横图保留；原图路径记录在各场景的 `photo.json` 中；每个场景目录保存按长边 640/1440/2400 像素生成的 `thumb.webp`、`screen.webp`、`detail.webp`，以及记录尺寸与哈希的 `photo.json`。沉浸查看使用 `immersive-blur/photo.jpg`（按原片像素尺寸构建，只用原片，球面仅覆盖来源画面，不含 AI 内容）。

| 场景 | 来源像素 | 作者与来源 | 许可 | 本地文件 |
| --- | --- | --- | --- | --- |
| 福田中心区·平安金融中心 | 4608×3072 | Chris from Shenzhen, China / Wikimedia Commons，[来源页](https://commons.wikimedia.org/wiki/File:Ping_An_Finance_Centre_Shenzhen_city_China_(36461945211).jpg) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | futian/original.jpg |
| 深圳·城市夜色 | 7002×4668 | 用户提供 | 未注明 | houhai/original.png |
| 前海·欢乐港湾 | 5019×3346 | ainc-t / Pexels，[来源页](https://www.pexels.com/photo/34947074/) | [Pexels License](https://www.pexels.com/license/) | qianhai/original.jpg |

Pexels 许可允许免费使用与修改，不强制署名；这里仍保留摄影者与原图页面便于核对。Wikimedia Commons 照片按各自许可使用：CC BY-SA 要求署名并以相同许可分享衍生图，CC0 无署名要求。

## 讲解与题目的事实来源

“深圳·城市夜色”的三个线索及对应题目依据用户提供原图中的可见内容：高楼群、山脊与弯曲道路。点位按该原图重新标定，不认定具体拍摄地点、楼宇名称或高度；内部场景 ID `sz-houhai` 仅为兼容既有素材路径保留。

- http://www.sznews.com/news/content/2019-04/09/content_21610673.htm
- http://ifutian.sznews.com/content/2018-03/09/content_18638064.htm
- https://www.szns.gov.cn/mlns/whns/tycg/content/post_12589347.html
- https://www.sznews.com/content/mb/2021-04/22/content_24154597.htm
- http://www.sznews.com/news/content/2021-04/06/content_24108184.htm
- https://www.gov.cn/jrzg/2010-08/27/content_1689210.htm

各场景的题目与行程站点另在 `content/shenzhen.js` 的 source 字段逐条标注。行程中的游览时长、坐标是原型规划参数，开放时间与预约以官方当日公告为准。
