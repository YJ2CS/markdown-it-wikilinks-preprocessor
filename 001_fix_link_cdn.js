// 感谢 https://github.com/lzuliuyun/hexo-image-cdn
// 感谢 https://github.com/2-3-5-7/hexo-relative-link
// 感谢 https://github.com/ikeq/hexo-filter-mathjax-ssr/issues/2#issuecomment-596960872
// 此代码参考了 hexo-image-link、hexo-asset-link

/* 
\s* 去除两侧的空格
[^\x00-\x1f\x7f]    -->          \x00-\x1f去除乱码的控制字符,x7f也是一个乱码字符
path： ([^\x00-\x1f\x7f]*?)    --> 除乱码字符外的所有字符，*?代表label可能为空
label：  (.+?)    -->   除换行符外的其他字符 
链接中包含 :// 的不匹配，来排除超链接
*/

const ob = options;

// 真实项目中调用下面即可记录错误日志
console.log("这是一条日志1");

/**
 * 结果字符串处理，处理不合格的url链接
 */
const reg_url_format = [
  /\\/g, //^ \ 替换为 /
  /(?<!:)(\/\/)/g, //^ //替换为/ ,忽略://格式的超链接
  /\s+/g, //^ 各种空格替换成%20
];

// 匹配四种代码块，含数学公式
var reg_code_block =
  /(`([^\\\``\n]|(\\.))+([^\\\``\n]*(\\.)?)*`)|((```)([^\\\``]|(\\.)|(`[^\\\``])|(``[^\\\``]))+([^\\\``]*((\\.)|(`[^\\\``])|(``[^\\\``]))?)*(```))|(\$([^\\\$\n]|(\\.))+([^\\\$\n]*(\\.)?)*\$)|(\$\$([^\\\$]|(\\.)|(\$[^\\\$]))+([^\\\$]*((\\.)|(\$[^\\\$]))?)*\$\$)/g;

// 识别出这是个行内代码块(数学公式)，解释数学公式时不需要改动，因此只要return word;就可以了。
var reg_code_block_1 = /`[^`][\s\S]*`/g;
// 识别出这是个代码块。
var reg_code_block_2 = /```\n*?[^\x00-\x1f\x7f]*?\n?[^\x00-\x1f\x7f]*?/g;
// 行内数学公式。
var reg_code_block_3 = /\$[^\$][\s\S]*\$/g;
// 单独一行的数学公式
var reg_code_block_4 = /\$\$[\s\S]*\$\$/g;
// 匹配代码块
var reg_code_block_5 = /[^\x00-\x1f\x7f]*?```/g;

//  [[path |label]] [[wikilink | label]]  后面的 label可有可无
const reg_wiki = /\[\[\s*([^\x00-\x1f\x7f]*?)\s*(\|\s*(.+?)\s*)?\s*\]\]/g;

// 匹配 [](xx.md) 形式
const reg_posts =
  /\[\s*([^\x00-\x1f\x7f]*?)\s*\]\(\s*(?!\S+:\/\/)(.+?)\.md\s*\)/g;

/* 
匹配 [](xxxxx) 形式
*/
var medias = ob.assets ? ob.assets.join("|") : "";
const reg_assets = new RegExp(
  "\\[\\s*([^\\x00-\\x1f\\x7f]*?)\\s*\\]\\(\\s*(?!\\S+:\\/\\/)(.+?\\." +
    "(" +
    medias +
    ")" +
    ")\\s*\\)",
  "g"
);

/* 
匹配 ![]() 形式
*/
const reg_img = /!\[\s*([^\x00-\x1f\x7f]*?)\s*\]\(\s*(?!\S+:\/\/)(.+?)\s*\)/g;
console.log("reg_img\n",reg_img.source,"\n");

/*
拼接的regExp结果
https://c.runoob.com/front-end/854/
*/
const reg_new = new RegExp(
  "(" +
    reg_wiki.source +
    ")|(" +
    reg_posts.source +
    ")|(" +
    reg_assets.source +
    ")|(" +
    reg_img.source +
    // ")|" +
    // "(" +
    // "(" +
    // reg_code_block_1.source +
    // ")|(" +
    // reg_code_block_2.source +
    // ")|(" +
    // reg_code_block_3.source +
    // ")|(" +
    // reg_code_block_4.source +
    // ")" +
    ")",
  "g"
);
console.log("reg_new\n", reg_new.source, "\n");

/**
 * 文章渲染之前批处理 替换链接，修复路径
 */
hexo.extend.filter.register("before_post_render", (data) => {
  // 加 url_fix 以避免在首页预览时链接错误
  const url_fix = ob.url_fix_enable
    ? new URL(data.permalink).pathname + "../"
    : "";

  data.content = data.content.replace(
    reg_new,
    (
      match,
      g1,
      g2,
      g3,
      g4,
      g5,
      g6,
      g7,
      g8,
      g9,
      g10,
      g11,
      g12,
      g13,
      g14,
      offset
    ) => {
      /**
       * 为[[wiki link]]做处理,wiki link to md link，
       * wiki link可以是.md .png .pdf .cn .com等等形式，所以先转为普通md link，
       * 保留.md .png等后缀不做处理，在后面再做处理
       * ^ [[path |label]] [[wikilink | label]]  后面的 label可有可无
       * ^ _split_with_label  --> `| label`
       */
      // [[ path |label ]]
      // g1 group
      // g2 path
      // g3 splitwithlabel
      // g4 label
      if (!isEmpty(g1) && !isEmpty(g2)) {
        // g2 = clearPath(g2);
        // return result_format("", url_fix, getLabel(g2, g4), g2, "");
        return g1;
      } else if (!isEmpty(g5) && !isEmpty(g7)) {
        /**
         * 为[](xxx.md)做处理去除.md后缀
         * ^ [](xxx.md) [label](path)
         */
        // [label](path)
        // g5 group
        // g6 label
        // g7 path
        g7 = clearPath(g7);
        return result_format(
          ob.posts_prefix,
          url_fix,
          getLabel(g7, g6),
          g7,
          ob.posts_extend
        );

        // return g5;
      } else if (!isEmpty(g8) && !isEmpty(g10)) {
        /**
         * 为附件assets： pdf/json等做处理，修改为cdn
         * 不处理md link /wiki link
         * ^ [](xxx.pdf) [label](path)
         * path  xxx.pdf  xxx.docx xxx.json etc.
         */
        // [label](path)  assets类型
        // g8 group
        // g9 label
        // g10 path
        // g11 extend
        g10 = clearPath(g10);
        return result_format(
          ob.assets_prefix,
          url_fix,
          getLabel(g10, g9),
          g10,
          ob.assets_extend
        );
      } else if (!isEmpty(g12) && !isEmpty(g14)) {
        /**
         * 替换掉所有的![label](path)格式，修改为cdn
         * ^ ![label](path)
         */
        // ![label](path)
        // g12 group
        // g13 label
        // g14 path
        g14 = clearPath(g14);
        return (
          "!" +
          result_format(
            ob.img_prefix,
            url_fix,
            getLabel(g14, g13),
            g14,
            ob.img_extend
          )
        );
      } else {
        return match;
      }
    }
  );

  return data;
});
/**
 * 判断字符串是否为空
 * @param {String} obj 字符串
 * @returns true：字符串为空。false：字符串不为空
 */
function isEmpty(obj) {
  if (typeof obj == "undefined" || obj == null || obj == "") {
    return true;
  } else {
    return false;
  }
}

/**
 * 处理URL，去除路径前缀
 * @param {string} str 处理前的字符串
 */
function clearPath(str) {
  // 使用lastIndexOf找到最后一个分隔符的位置
  const lastIndex = str.lastIndexOf("\\");

  // 如果找到了分隔符，则截取最后一个分隔段
  if (lastIndex !== -1) {
    return str.substring(lastIndex + 1);
  }

  // 如果没有找到分隔符，则返回原始字符串
  return str;
}
/**
 * 是否是四种代码块之一，
 * deprecated 弃用
 * @param {String} match
 * @returns true：是代码块。false：不是代码块。
 */
function isCode(match) {
  // reg 匹配四种代码块，包括数学公式
  var reg =
    /(`([^\\\``\n]|(\\.))+([^\\\``\n]*(\\.)?)*`)|((```)([^\\\``]|(\\.)|(`[^\\\``])|(``[^\\\``]))+([^\\\``]*((\\.)|(`[^\\\``])|(``[^\\\``]))?)*(```))|(\$([^\\\$\n]|(\\.))+([^\\\$\n]*(\\.)?)*\$)|(\$\$([^\\\$]|(\\.)|(\$[^\\\$]))+([^\\\$]*((\\.)|(\$[^\\\$]))?)*\$\$)/g;
  if (reg.test(match)) {
    // 识别出这是四种代码块之一，
    return true;
  }
  return false;
}

/**
 * 判断是否有标签
 * @param {String} label 标签
 * @param {String} path url路径（非全）
 * @returns 如果有标签，则返回标签。否则返回路径作为标签
 */
function getLabel(path, label) {
  //如果label不为空，  return label
  return label ? label : path;
}
/**
 * 对字符串进行格式化，得到格式化后结果
 * @param {String} prefix 前缀
 * @param {String} url_fix url修复段
 * @param {String} label 标签
 * @param {String} path url路径
 * @param {String} extend 后缀
 * @returns 格式化后的字符串
 */
function result_format(prefix, url_fix, label, path, extend) {
  var fianl_link = (prefix + url_fix + path + extend)
    .replace(reg_url_format[0], "/")
    .replace(reg_url_format[1], "/")
    .replace(reg_url_format[2], "%20");
  var result_str = "[" + label + "](" + fianl_link + ")";
  return result_str;
}
/**
 * 匹配是否是代码块
 * deprecated 弃用
 * @param {String} match 要匹配的字符串
 * @returns 一个字符串：表明是代码块。null：表明不是代码块
 */
function isCodeBlock(match) {
  // reg 匹配四种代码块，包括数学公式
  var reg =
    /(`([^\\\``\n]|(\\.))+([^\\\``\n]*(\\.)?)*`)|((```)([^\\\``]|(\\.)|(`[^\\\``])|(``[^\\\``]))+([^\\\``]*((\\.)|(`[^\\\``])|(``[^\\\``]))?)*(```))|(\$([^\\\$\n]|(\\.))+([^\\\$\n]*(\\.)?)*\$)|(\$\$([^\\\$]|(\\.)|(\$[^\\\$]))+([^\\\$]*((\\.)|(\$[^\\\$]))?)*\$\$)/g;
  // match 就是上文的markdown匹配数据
  match.replace(reg, function (word) {
    if (/^`[^`][^]*/.test(word)) {
      // 识别出这是个行内代码块(数学公式)，解释数学公式时不需要改动，因此只要return word;就可以了。
      return "<inline-code>";
    } else if (/^```[^]*/.test(word)) {
      // 识别出这是个代码块。
      return "<code block>";
    } else if (/^\$[^\$][^]*/.test(word)) {
      // 行内数学公式。
      return "<inline-math>";
    } else {
      // 数学公式块。
      return "<math-block>";
    }
  });
  return null;
}
