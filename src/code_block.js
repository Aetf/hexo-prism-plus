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

    _transform = post => {
        const { hexo, opts, highlighter } = this;
        if (!opts.enable)
            return;

        // post may contain prism deps added by other code block/tag, make a set first to avoid duplication
        const post_deps = new Set(post._prism_plus_deps);
        post.content = post.content.replace(rBacktick, (...argv) => {
            const { start, end, args, code } = argv.pop();

            const { rendered: html, allDeps } = highlighter.highlight(code, args.trim().split(' ').filter(v => v));

            for (const d of allDeps) {
                post_deps.add(d);
            }
            hexo.log.debug('Saved', allDeps, 'to post:', post_deps);

            return `${start}<hexoPostRenderCodeBlock>${html}</hexoPostRenderCodeBlock>${end}`;
        });
        // make sure to modify inplace, the post object may be shadow copied around
        post._prism_plus_deps.splice(0, post._prism_plus_deps.length, ...post_deps);
    }

    register() {
        this.hexo.extend.filter.register('before_post_render', this._transform);
    }
}

module.exports.BacktickCodeBlockFilter = BacktickCodeBlockFilter;
