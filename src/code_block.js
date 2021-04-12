'use strict';

// begining white spaces
// opening ``` or ~~~ with any options
// code content, lazy match
// closing ``` or ~~~ with trailing white spaces
const rBacktick = /^(?<start>\s*)(?<tick>~{3,}|`{3,})(?<args>.*)\n(?<code>[\s\S]*?)^\s*\k<tick>(?<end>\s*)$/gm;

class BacktickCodeBlockFilter {
    constructor(hexo, opts, highlighter) {
        this.hexo = hexo;
        this.opts = opts;
        this.highlighter = highlighter;
    }

    _transform = data => {
        const { hexo, opts, highlighter } = this;
        if (!opts.enable)
            return;

        data.content = data.content.replace(rBacktick, (...argv) => {
            const { start, end, args, code } = argv.pop();

            const html = highlighter.highlight(code, args.trim().split(' ').filter(v => v));

            return `${start}<hexoPostRenderCodeBlock>${html}</hexoPostRenderCodeBlock>${end}`;
        });
    }

    register() {
        this.hexo.extend.filter.register('before_post_render', this._transform);
    }
}

module.exports.BacktickCodeBlockFilter = BacktickCodeBlockFilter;
