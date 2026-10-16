# 高清照片空间探索 demo

从仓库根目录启动静态服务器，访问 `/demos/immersive-photo/`。独立实验入口，未接入正式游戏流程。

只显示照片：没有标题、线索、计数、提示、按钮或其他可见文字。手机竖屏窗口宽高比 9:18（高宽 18:9），根据浏览器宽度和可见高度等比适配，桌面居中，照片铺满窗口，页面不滚动。拖动或方向键观察，双击复位。

复用天子山源图 8841 × 4415；显卡最大纹理不足时加载现有 2400px detail.webp。人工近似深度驱动受限视差，没有生成真实 3D 或 360° 场景，局部可能形变。WebGL 不可用时回退静态照片。遵循减少动态效果设置，无自动巡游。

摄影：chensiyuan / Wikimedia Commons。
来源：https://commons.wikimedia.org/wiki/File:1_tianzishan_wulingyuan_zhangjiajie_2012.jpg
许可：https://creativecommons.org/licenses/by-sa/4.0/ （CC BY-SA 4.0）。照片空间效果为衍生呈现，沿用 CC BY-SA 4.0；原图未改。页面含辅助技术可读署名，原有素材记录见 `../../photo-library/zhangjiajie/ATTRIBUTION.md`。
