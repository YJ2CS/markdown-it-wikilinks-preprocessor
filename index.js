//  [[path |label]] [[wikilink | label]]  后面的 label可有可无
const reg_wiki = /\[\[\s*([^\x00-\x1f\x7f]*?)\s*(\|\s*(.+?)\s*)?\s*\]\]/g;


const markdownItLinkPreprocessor = (md) => {
    // 在内容解析之前进行预处理
    md.core.ruler.before('normalize', 'preprocess_custom_links', (state) => {
        state.src = state.src.replace(reg_wiki, (match, href, seperator_label, label) => {
            debugger
            const [txt, url] = label ? [label, href] : [href, href];
            return `[${txt.trim()}](${url.trim()})`;
        });
    });
};

export default markdownItLinkPreprocessor;
