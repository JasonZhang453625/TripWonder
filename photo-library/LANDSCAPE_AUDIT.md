# 横向超高清场景素材审计

核验日期：2026-10-17。实际解码检查全部 34 处场景（25 处官方、9 处示例 UGC），均为横图，宽不小于3840、高不小于2160。三条玩家 Journey 均为 3 张照片，符合 3–9 张限制。原图未裁切、扩图或插值放大；探索纹理维持来源尺寸，设备纹理上限不足时仍由现有查看器等比缩绘。

本轮新增或升级10处：大同2、苏州3（新增2处）、深圳1、张家界3、十八梯1；已有合格横图保留。各新图的来源、许可、下载地址和焦点见 [来源清单](landscape-sources.json)，逐场景原图哈希与展示尺寸见 photo.json。

| 目的地 | 场景ID | 实际原图尺寸 | 像素量 |
| --- | --- | --- | --- |
| datong | yungang | 6000×4000 | 24 MP |
| datong | huayan | 6000×4000 | 24 MP |
| datong | xuankong | 5472×3648 | 20 MP |
| shenzhen | sz-futian | 4608×3072 | 14.2 MP |
| shenzhen | sz-houhai | 7002×4668 | 32.7 MP |
| shenzhen | sz-qianhai | 5019×3346 | 16.8 MP |
| suzhou | suzhou-zhuozheng | 6016×4016 | 24.2 MP |
| suzhou | suzhou-huqiu | 4000×3000 | 12 MP |
| suzhou | suzhou-shantang | 4000×3000 | 12 MP |
| guilin | gl-xingping | 6000×4000 | 24 MP |
| guilin | gl-yulong | 5996×3683 | 22.1 MP |
| guilin | gl-longji | 3840×2880 | 11.1 MP |
| hongkong | hk-peak | 6000×4000 | 24 MP |
| hongkong | hk-star-ferry | 3840×2880 | 11.1 MP |
| hongkong | hk-sham-shui-po | 5612×3741 | 21 MP |
| beijing | bj-zhengyangmen | 4096×3072 | 12.6 MP |
| beijing | bj-hongyige | 8164×5443 | 44.4 MP |
| beijing | bj-beihai | 9504×6336 | 60.2 MP |
| shanghai | sh-bund | 6240×4160 | 26 MP |
| shanghai | sh-lujiazui | 8434×5623 | 47.4 MP |
| shanghai | sh-bund-night | 4701×3134 | 14.7 MP |
| zhangjiajie | zjj-tianzishan | 8841×4415 | 39 MP |
| zhangjiajie | zjj-misty-peaks | 7770×5183 | 40.3 MP |
| zhangjiajie | zjj-tianmen-cave | 4000×3000 | 12 MP |
| zhangjiajie | zjj-winding-road | 4272×2848 | 12.2 MP |
| ugc-shapowei | ugc-shapowei-harbor-2015 | 5616×3744 | 21 MP |
| ugc-shapowei | ugc-shapowei-harbor-now | 4800×3600 | 17.3 MP |
| ugc-shapowei | ugc-shapowei-harbor-wide | 4800×3200 | 15.4 MP |
| ugc-shibati | ugc-shibati-old-steps | 4608×3456 | 15.9 MP |
| ugc-shibati | ugc-shibati-new-street | 5184×3456 | 17.9 MP |
| ugc-shibati | ugc-shibati-street-2024 | 4080×2292 | 9.4 MP |
| ugc-dongjiao | ugc-dongjiao-south-gate | 4096×3072 | 12.6 MP |
| ugc-dongjiao | ugc-dongjiao-theatre | 4096×3072 | 12.6 MP |
| ugc-dongjiao | ugc-dongjiao-metro-platform | 3868×2901 | 11.2 MP |

检查命令：`node check-landscape-media.cjs`。同时验证三档WebP尺寸、源文件哈希、沉浸图完整像素、缓存哈希、三题场景引用和讲解点坐标范围。来源站素材并不都为相机原片；Unsplash记录的是站点全尺寸JPEG。

本轮验证：八城25处场景的讲解点击、场景切换、答题往返、拖动、缩放与留言定位通过；修改涉及的13处城市场景另核对初始焦点与原生尺寸；十八梯新图5184×3456及更新题目通过，file://大同6000×4000内嵌预览通过。`npm test`与`npm run --prefix mobile build:hosting`通过。以上为桌面浏览器模拟手机视口，未部署、未做手机真机验收。
