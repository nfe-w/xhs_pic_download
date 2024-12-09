# XhsPicDownload

## 简介

结合iOS的“快捷指令”，一键从小红书下载无水印图片/视频

> Live Photo 会被拆分为封面图片 + 一段视频，可自行使用其他 App 进行合并

## 使用教程

### Docker

```sh
# 构建镜像
docker build -t nfew/xhs_pic_download:latest .

# 启动容器
docker run -d -p 7776:7776 --name xhs_pic_download nfew/xhs_pic_download:latest
```

#### 1. 部署

请使用 docker 自行部署

#### 2. 添加 iPhone 快捷指令

(1) 在 iPhone 的浏览器中，打开以下链接。

https://www.icloud.com/shortcuts/fef496ed540e42949e8154ddbf6ac8f9


(2) 在打开的页面中点击「获取捷径」按钮，然后在弹出的窗口中点击「添加快捷指令」。

(3) 点击刚刚添加成功的快捷指令右上角的三个点，打开快捷指令的编辑页面。将服务器部署的 URL 填入「文本」区域，点击右上角「完成」。

> 注意：类似 `https://1.2.3.4/getXhsPicUrl` 这样的格式。

#### 3. 使用

在小红书客户端，点击动态详情，右上角的箭头分享按钮，点击「复制链接」，打开「快捷指令」App，单击「一键保存小红书图片/视频」即可（会自动获取剪切板）。

## 声明:

- 本仓库发布的`xhs_pic_download`项目中涉及的任何脚本，仅用于测试和学习研究，禁止用于商业用途
- `nfe-w` 对任何脚本问题概不负责，包括但不限于由任何脚本错误导致的任何损失或损害
- 以任何方式查看此项目的人或直接或间接使用`xhs_pic_download`项目的任何脚本的使用者都应仔细阅读此声明
- `xhs_pic_download` 保留随时更改或补充此免责声明的权利。一旦使用并复制了任何相关脚本或`xhs_pic_download`项目，则视为已接受此免责声明
- 本项目遵循`MIT LICENSE`协议，如果本声明与`MIT LICENSE`协议有冲突之处，以本声明为准