# XhsPicDownload

## 简介

结合iOS的“快捷指令”，一键从小红书下载无水印图片

## 使用教程

### Docker

```sh
# 构建镜像
docker build -t nfew/xhs_pic_download:latest .

# 启动容器
docker run -d -p 7776:7776 --name xhs_pic_download nfew/xhs_pic_download:latest
```

## 声明:

- 本仓库发布的`xhs_pic_download`项目中涉及的任何脚本，仅用于测试和学习研究，禁止用于商业用途
- `nfe-w` 对任何脚本问题概不负责，包括但不限于由任何脚本错误导致的任何损失或损害
- 以任何方式查看此项目的人或直接或间接使用`xhs_pic_download`项目的任何脚本的使用者都应仔细阅读此声明
- `xhs_pic_download` 保留随时更改或补充此免责声明的权利。一旦使用并复制了任何相关脚本或`xhs_pic_download`项目，则视为已接受此免责声明
- 本项目遵循`MIT LICENSE`协议，如果本声明与`MIT LICENSE`协议有冲突之处，以本声明为准