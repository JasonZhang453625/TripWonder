# 张家界照片与内容来源

四份原始文件由用户于 2026-09-27 放入 `D:\携程`，现已按场景统一归档。文件仅移动、改名，SHA-256 与导入前一致；原来的文件名记录在各场景的 `photo.json.originalFilename` 中。

| 场景 | 归档原图 | 作者与来源页 | 图片许可 |
| --- | --- | --- | --- |
| 天子山·砂岩峰林 | [tianzishan/original.jpg](tianzishan/original.jpg) | chensiyuan，[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:1_tianzishan_wulingyuan_zhangjiajie_2012.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| 云雾峰林·山间光影 | [misty-peaks/original.avif](misty-peaks/original.avif) | Joshua Sortino，[Unsplash](https://unsplash.com/photos/aerial-view-of-mountains-gii7lF4y0WY) | [Unsplash License](https://unsplash.com/license) |
| 天门山·天门洞 | [tianmen-cave/original.jpg](tianmen-cave/original.jpg) | xiquinhosilva，[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Tianmen_38330-Zhangjiajie_(49047525877).jpg) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| 天门山·通天大道 | [winding-road/original.jpg](winding-road/original.jpg) | 王计，[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Winding_road,_Tianmen_Mountain.jpg) | [CC BY 2.5](https://creativecommons.org/licenses/by/2.5/) |

来源与署名核对日期：2026-09-27。天子山照片的本地版本为 8841 × 4415 像素，与来源页展示的画面及像素尺寸对应，但文件大小不同，不能据此声称是来源站未经再编码的上传文件。云雾峰林采用用户提供的 2670 × 1781 AVIF 版本，保留右下角摄影师水印；Unsplash 图片链接中的资源标识与原文件名一致。该页描述为张家界峰壁，但地点标签混有“Huaihua”，故本场景不指定未经核实的具体峰名、机位或拍摄时段。

探索素材 `immersive-blur/photo.jpg` 使用各本地来源的完整像素尺寸。三张方向正确的 JPEG 原样复制；AVIF 另生成 JPEG 98 质量、4:4:4 色度采样的展示素材，原 AVIF 不变。封面、小卡片另生成 WebP，不放大低于目标尺寸的来源图。浏览器根据照片生成模糊边缘并进行圆柱投影，无 AI 补景、去水印或主体修补。天子山照片的这些图片衍生版本继续按 CC BY-SA 4.0 提供，其他图片按各自许可保留署名。

重建本城市素材：`node photo-library/zhangjiajie/build.cjs`。脚本更新四个场景的 WebP、沉浸素材、来源哈希、`content/zhangjiajie.js` 中标记的图片数据和 `immersive-scenes.js` 中的四项配置，不改动原图及其他目的地素材。线索、题目和路线文字直接维护在 `content/zhangjiajie.js`。

## 线索与题目依据

- [UNESCO：武陵源风景名胜区](https://whc.unesco.org/en/list/640/)：石英砂岩峰林、森林、沟谷和云雾景观。用于第一处的自然线索；第二处的光影、层次和前景描述直接来自用户照片，不推定具体机位。
- [湖南省林业局：天门山国家森林公园](https://lyj.hunan.gov.cn/tslm_71206/slly/slgy/201512/t20151227_2587623.html)：上天梯 999 级及登高祈福寓意；通天大道约 10.77 公里、99 道弯。用于第三、四处线索及台阶题。
- [湖南省林业局：天门山自然保护区](https://lyj.hunan.gov.cn/tslm_71206/slly/zrbhq/201512/t20151227_2587436.html)：天门山属于喀斯特岩溶地貌，有天然天门洞。用于与前面砂岩峰林的区别。
- [湖南省文化和旅游厅：张家界国家森林公园](https://whhlyt.hunan.gov.cn/whhlyt/english/Tourism/NationalForestParks/202205/t20220530_24762927.html)：袁家界、金鞭溪、黄石寨、杨家界等游览区域。路线中的天门洞与通天大道合并为同一景区停留点；坐标为区域参考点，停留时间为原型规划估计，不代表具体入口、预约或运营时刻。
- 城市定位使用项目已有 `assets/map/cities/430000.geojson` 中张家界市的 `properties.center`：东经 110.479921、北纬 29.127401，来源为 DataV.GeoAtlas。

第一题按前两幅图中的峰柱和岩壁作答；第三题依据第四幅图的折返路段，推理同样高差分摊到更长路线的作用。每题 20 分，沿用原型三题共 120 秒及地图定位 40 分的计分规则。
