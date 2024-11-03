# Markdown-It Wikilinks

[![Build Status](https://travis-ci.org/ig3/markdown-it-wikilinks.svg?branch=master)](https://travis-ci.org/ig3/markdown-it-wikilinks) [![Coverage Status](https://coveralls.io/repos/github/ig3/markdown-it-wikilinks/badge.svg?branch=master)](https://coveralls.io/github/ig3/markdown-it-wikilinks?branch=master)

Renders [Wikimedia-style links](https://www.mediawiki.org/wiki/Help:Links#Internal_links) in [markdown-it](https://github.com/markdown-it/markdown-it). This is useful for making Markdown-based wikis.

## Usage

Install this into your project:

```bash
npm --save install @stunned3961/markdown-it-wikilinks-preprocessor
```

...and *use* it:

```js
const markdownItLinkPreprocessor = require('@stunned3961/markdown-it-wikilinks-preprocessor');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt();
md.use(markdownItLinkPreprocessor);
const result = md.render('Click [[Wiki Links|here]] to learn about [[/Wiki]] links.')
console.log(result);
```

**Output:**

```html
<p>Click <a href="./Wiki_Links.html">here</a> to learn about <a href="/Wiki.html">Wiki</a> links.</p>
```


## TODO

* Unit test options
* Add examples to `postProcessPageName` and `postProcessLabel`

## Credits

Based on [markdown-it-wikilinks](https://github.com/jsepia/markdown-it-wikilinks) by Julio Sepia, [@kwvanderlinde/markdown-it-wikilinks](https://github.com/kwvanderlinde/markdown-it-wikilinks) by Kenneth VanderLinde and [markdown-it-wikilinks](https://github.com/osmarks/markdown-it-wikilinks) by Oliver Marks.

Based on [markdown-it-ins](https://github.com/markdown-it/markdown-it-ins) by Vitaly Puzrin, Alex Kocharin.
