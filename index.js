const ob = {
    assets: ['pdf', 'json'],
    // # 指定到images目录，例如https://webdav-1309345210.file.myqcloud.com/images
    img_prefix: "https://webdav-1309345210.file.myqcloud.com/images/",
    // # 默认: ""
    img_extend: "",

    assets_prefix: "https://webdav-1309345210.file.myqcloud.com/assert/",
    assets_extend: "",
    posts_prefix: "",
    posts_extend: "",
}

//  [[path |label]] [[wikilink | label]]  后面的 label可有可无
const reg_wiki = /\[\[\s*([^\x00-\x1f\x7f]*?)\s*(\|\s*(.+?)\s*)?\s*\]\]/g;

/*
匹配 ![]() 形式
*/
const reg_img = /!\[\s*([^\x00-\x1f\x7f]*?)\s*\]\(\s*(?!\S+:\/\/)(.+?)\s*\)/g;
//console.log("reg_img\n",reg_img.source,"\n");

/*
匹配 [](xxxxx) 形式
*/
const medias = ob.assets ? ob.assets.join("|") : "";
const reg_assets = new RegExp(
    "\\[\\s*([^\\x00-\\x1f\\x7f]*?)\\s*\\]\\(\\s*(?!\\S+:\\/\\/)(.+?\\." +
    "(" +
    medias +
    ")" +
    ")\\s*\\)",
    "g"
);

/**
 * 处理URL，去除路径前缀
 * @param {string} str 处理前的字符串
 */
function clearPath(str) {
    // 使用lastIndexOf找到最后一个分隔符的位置
    let lastIndex = str.lastIndexOf("\\");

    if (lastIndex === -1) {
        lastIndex = str.lastIndexOf("/");
    }
    // 如果找到了分隔符，则截取最后一个分隔段
    if (lastIndex !== -1) {
        return str.substring(lastIndex + 1);
    }

    // 如果没有找到分隔符，则返回原始字符串
    return str;
}

const markdownItLinkPreprocessor = (md) => {
    // 在内容解析之前进行预处理

    // 修改 [[]] 语法 ，改为 []() 语法
    md.core.ruler.before('normalize', 'preprocess_custom_links', (state) => {
        state.src = state.src.replace(reg_wiki, (match, href, seperator_label, label) => {
            debugger
            const [txt, url] = label ? [label, href] : [href, href];
            return `[${txt.trim()}](${url.trim()})`;
        });
    });

    // 修改 asserts类型文件，添加cdn支持
    md.core.ruler.before('normalize', 'preprocess_custom_asserts', (state) => {
        state.src = state.src.replace(reg_assets, (match, label, href, extend) => {
            debugger
            href = clearPath(href);
            [label, href] = label ? [label, href] : [href, href];
            return `[${label.trim()}](${ob.assets_prefix}${href.trim()}${ob.assets_extend})`;
        });
    });

    // 修改 img 类型文件，添加cdn支持
    md.core.ruler.before('normalize', 'preprocess_custom_images', (state) => {
        state.src = state.src.replace(reg_img, (match, label, href) => {
            debugger
            href = clearPath(href);
            [label, href] = label ? [label, href] : [href, href];
            return `![${label.trim()}](${ob.img_prefix}${href.trim()}${ob.img_extend})`;
        });
    });
};

export default markdownItLinkPreprocessor;
