
const MarkdownIt = require('markdown-it');
const linkReplacePlugin = require('./linkReplacePlugin');

const md = new MarkdownIt();
md.use(linkReplacePlugin);

const result = md.render(`这是一个自定义链接 [[example|示例]] 和 [[anotherExample]] 内嵌语法。`);
console.log(result);
