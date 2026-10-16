# 球面实景探索 demo

可复用处理流程见 [WORKFLOW.md](WORKFLOW.md)：横向高清图 → 方向/尺寸/来源检查 → 生成场景配置 → 球面投影 → 手机预览与验证。

运行 `python3 demos/immersive-photo/workflow.py` 生成配置，在仓库根目录启动静态服务器；打开 `/demos/immersive-photo/?scene=<场景ID>`。

现有场景：`zjj-tianzishan`、`gl-yulong`、`gl-longji`、`bj-zhengyangmen`、`sh-bund-night`。新增图片只需登记 `sphere-inputs.json` 并重新生成，无需修改渲染器。

只显示图片，窗口高宽 18:9；拖动或方向键转头，双击复位。球心视点固定，无深度图、平移视差或 AI 补景。横图仅覆盖球体内壁的一部分，不是真实完整全景；球面投影仍有形变，详见工作流中的选图说明。

独立实验入口，未接入正式游戏，未部署。各图的摄影者、来源、许可见配置及 `photo-library/<城市>/ATTRIBUTION.md`；照片衍生呈现继续遵循对应许可，原图不变。
