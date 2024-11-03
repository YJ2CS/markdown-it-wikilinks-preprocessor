module.exports = function linkReplacePlugin(md) {
    // 正则表达式匹配 [[page|label]] 语法
    const linkPattern = /\[\[([-\w\s/]+)(\|([-\w\s/]+))?\]\]/g;

    // 核心处理器，用于文本替换
    md.core.ruler.push('replace_custom_link_syntax', function (state) {
        // 遍历所有 tokens
        state.tokens.forEach((token) => {
            if (token.type === 'inline') {
                token.children.forEach((child) => {
                    if (child.type === 'text' && linkPattern.test(child.content)) {
                        // 使用正则替换 [[page|label]] 为 [label](page)
                        child.content = child.content.replace(linkPattern, (match, page, _, label) => {
                            label = label || page;  // 如果没有提供 label，就使用 page 作为 label
                            return `[${label}](${page})`;  // 返回标准 Markdown 链接语法
                        });
                    }
                });
            }
        });
    });
};
