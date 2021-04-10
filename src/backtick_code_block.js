'use strict';

const rBacktick = new RegExp([
    /^(\s*)/                  // begining white spaces
    , /(~{3,}|`{3,})(.*)\n/   // opening ``` or ~~~ with any options
    , /([\s\S]*?)/           // code content, lazy match
    , /^\s*\2(\s*)$/          // closing ``` or ~~~ with trailing white spaces
].map(function (r) { return r.source; }).join(''), 'gm');

class BacktickCodeBlockFilter {
    constructor(hexo, opts, highlighter) {
        this.hexo = hexo;
        this.opts = opts;
        this.highlighter = highlighter;
    }

    _transform = data => {
        const { hexo, opts } = this;
        if (!opts.enable)
            return;

        data.content = data.content.replace(rBacktick, () => {
            let start = arguments[1];
            let end = arguments[5];
            let args = arguments[3];
            let code = arguments[4];

            args = args.trim().split(' ').filter(v => v);
            const html = highlighter.highlight(code, args);
            return `${start}<hexoPostRenderCodeBlock>${html}</hexoPostRenderCodeBlock>${end}`;
        });
    }
    register() {
        this.hexo.extend.filter.register('before_post_render', this._transform);
    }
}

module.exports.BacktickCodeBlockFilter = BacktickCodeBlockFilter;
