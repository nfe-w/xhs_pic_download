const axios = require('axios')
const cheerio = require('cheerio');

// 只请求小红书的域名，避免服务被用来访问任意地址（SSRF）
const ALLOWED_HOSTS = /(^|\.)(xhslink\.(com|cn)|xiaohongshu\.com)$/i
function assertAllowed(url) {
  const u = new URL(url)
  if (!/^https?:$/.test(u.protocol) || !ALLOWED_HOSTS.test(u.hostname)) {
    throw new Error('只支持小红书链接')
  }
  return u.toString()
}
const REQUEST_OPTIONS = {
  timeout: 15000,
  maxContentLength: 5 * 1024 * 1024,
  beforeRedirect: (options) => {
    if (!ALLOWED_HOSTS.test(options.hostname)) {
      throw new Error('不允许跳转到非小红书域名')
    }
  },
}

module.exports = async function (params, context) {
  const shareText = params['shareText']
  const xhsCookie = params['xhsCookie']
  if (!shareText) {
    return {
      error: '缺少shareText参数',
    }
  }

  console.log(`shareText->${shareText}`)
  const fullUrl = await getFullURL(shareText)
  console.log(`fullUrl->${fullUrl}`)

  const picUrlArray = await getPicUrl(fullUrl, xhsCookie)
  return {
    picUrlArray,
  }
}

async function getHeaders() {
  // 桌面版 UA 现在会被重定向到登录页，移动版（iPhone Safari）页面仍可匿名访问
  return {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "zh-CN,zh-Hans;q=0.9",
    "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  }
}

async function getFullURL(shortURLWithText) {
  const headers = await getHeaders()
  // 正则表达式提取url
  const urlRegex = /(http[s]?:\/\/[^\s，]+)/;
  const match = shortURLWithText.match(urlRegex)
  if (!match) {
    throw new Error('shareText中没有找到链接')
  }
  const shortURL = assertAllowed(match[0]);
  try {
    const response = await axios.get(shortURL, {
      headers,
      ...REQUEST_OPTIONS,
      maxRedirects: 0
    })
    return shortURL
  } catch (error) {
    if (!error.response || !error.response.headers.location) {
      throw error
    }
    return assertAllowed(new URL(error.response.headers.location, shortURL).toString())
  }
}

async function findDom(htmlContent) {
  const $ = cheerio.load(htmlContent);

  let initialStateScript;
  $('script').each((index, script) => {
    const scriptContent = $(script).html();
    if (scriptContent && scriptContent.includes('window.__INITIAL_STATE__')) {
      initialStateScript = scriptContent;
    }
  });

  // 提取window.__INITIAL_STATE__的值
  let initialState;
  if (initialStateScript) {
    const startIndex = initialStateScript.indexOf('{');
    const endIndex = initialStateScript.lastIndexOf('}');

    if (startIndex !== -1 && endIndex !== -1) {
      const jsonString = initialStateScript.substring(startIndex, endIndex + 1);
      // 不能用 eval 执行远程内容；该对象除了值为 undefined 的字段外就是合法 JSON
      initialState = JSON.parse(jsonString.replace(/([:\[,])\s*undefined(?=\s*[,}\]])/g, '$1null'));
    }
  }
  return initialState
}

async function getPicUrl(fullUrl, xhsCookie) {
  const headers = await getHeaders()
  if (xhsCookie) {
    headers['cookie'] = xhsCookie
  }
  const response = await axios.get(assertAllowed(fullUrl), {
    headers,
    ...REQUEST_OPTIONS,
    maxRedirects: 3
  })
  const responseData = response.data
  const resultObj = await findDom(responseData)

  let picIdArray = []
  let note = null
  let imageList = []
  try {
    // 兼容桌面版页面结构和移动版页面结构（state.noteData.data.noteData）
    note = resultObj?.note?.noteDetailMap?.[resultObj?.note?.firstNoteId]?.note || resultObj?.noteData?.data?.noteData
    if (!note) {
      throw new Error('未找到笔记（需要登录或笔记已删除）')
    }
    imageList = note?.imageList || []
    const regex = /https?:\/\/sns-webpic-qc\.xhscdn\.com\/\d+\/[0-9a-z]+\/(\S+)!/;
    imageList.forEach((item) => {
      const tempUrl = item.infoList[0].url
      let match = tempUrl.match(regex)
      if (match && match[1]) {
        picIdArray.push(match[1])
      }
    })
  } catch (error) {
    console.log(error)
    throw new Error('不包含图片')
  }
  let picUrlArray = []
  if (picIdArray && picIdArray.length > 0) {
    // 不带 imageView2 参数时返回原图（原始分辨率、原始格式），带 format/png 参数现在会返回 404
    picIdArray.forEach((item) => picUrlArray.push(`https://ci.xiaohongshu.com/${item}`))
  }

  imageList.forEach((item) => {
    try {
      const livePhotoVideoUrl = item?.stream?.h264?.[0]?.masterUrl
      if(livePhotoVideoUrl){
        picUrlArray.push(livePhotoVideoUrl)
      }
    } catch (error) {
      console.log(error)
    }
  })

  let videoUrl = null
  try {
    const media = note.video?.media
    if (media) {
      const streamType = media.video?.streamTypes?.[0]
      Object.entries(media.stream || {}).forEach(([key, value]) => {
        if (value.length > 0 && value[0].streamType === streamType) {
          videoUrl = value[0].masterUrl
        }
      })
      // 没有匹配的 streamType 时，取第一个可用的视频流
      if (!videoUrl) {
        for (const codec of ['h265', 'h264', 'av1']) {
          const url = media.stream?.[codec]?.[0]?.masterUrl
          if (url) {
            videoUrl = url
            break
          }
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
  if (videoUrl) {
    picUrlArray.push(videoUrl)
  }
  return picUrlArray
}