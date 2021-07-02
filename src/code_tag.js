'use strict';

const pathFn = require('path');
const fs = require('fs/promises');
const fsOld = require('fs');

/**
 * Include code tag
 *
 * Synctax:
 *     {% code /path/to/file [inline options]%}
 */
class IncludeCodeTag {
    constructor(hexo, opts, highlighter) {
        this.hexo = hexo;
        this.opts = opts;
        this.highlighter = highlighter;
    }

    _tag = async (post, args) => {
        const { hexo, opts, highlighter } = this;
        const codeDir = hexo.config.code_dir;

        if (!opts.enable)
            return;

        args = args.filter(v => v);

        const path = args.shift();
        // Exit if path is not defined
        if (!path)
            return;

        const src = pathFn.join(hexo.source_dir, codeDir, path);
        const code = await fs.readFile(src, 'utf-8');

        const { rendered, allDeps } = highlighter.highlight(code, args);

        const post_deps = new Set([...post._prism_plus_deps, ...allDeps]);
        // make sure to modify inplace, the post object may be shadow copied around
        post._prism_plus_deps.splice(0, post._prism_plus_deps.length, ...post_deps);

        hexo.log.debug('Saved', allDeps, 'to post:', post._prism_plus_deps);

        return rendered;
    }

    register() {
        const self = this;
        this.hexo.extend.tag.register('includecode', function(args) { return self._tag(this, args); }, { async: true });
    }
}

module.exports.IncludeCodeTag = IncludeCodeTag;
