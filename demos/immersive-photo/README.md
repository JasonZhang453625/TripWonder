# 球面实景探索 demo

从仓库根目录启动静态服务器，访问 `/demos/immersive-photo/`。独立实验入口，未接入正式游戏流程。

只显示照片，没有标题、线索、计数、提示或按钮。手机竖屏窗口宽高比 9:18（高宽 18:9），随浏览器可见宽高等比适配。拖动或方向键转动视角，双击复位。

## 球心视点与内壁贴图

将矩形照片按经纬度贴在球体内壁的有限区域。摄影机固定在球心，以 58° 垂直视场角生成透视射线；拖动只改变 yaw/pitch。射线与球面的交点转换为经纬度纹理坐标，产生球幕环绕的投影效果。

照片覆盖水平 150°，垂直角度按照片比例确定（本图约 75°）。转动范围根据视场角和四角射线保守限制，避免看到照片边界以外；不重复、镜像或生成缺失景物。没有深度图、人工前后景划分、相机平移或视差变形。普通照片并非真实全景采集，贴球会产生投影形变，属于球幕体验模拟，不代表 CGV SphereX 官方实现。

复用源图 8841 × 4415；显卡纹理上限不足时使用已有 2400px detail.webp。WebGL 不可用时回退静态照片。遵循减少动态效果设置，无自动巡游。

摄影：chensiyuan / Wikimedia Commons。
来源：https://commons.wikimedia.org/wiki/File:1_tianzishan_wulingyuan_zhangjiajie_2012.jpg
许可：https://creativecommons.org/licenses/by-sa/4.0/ （CC BY-SA 4.0）。照片球面呈现为衍生效果，沿用 CC BY-SA 4.0；原图未改。页面保留辅助技术可读署名，素材记录见 `../../photo-library/zhangjiajie/ATTRIBUTION.md`。
