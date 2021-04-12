'use strict';

const pathFn = require('path');
const fs = require('fs/promises');

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

    _tag = async args => {
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

        return highlighter.highlight(code, args);
    }

    register() {
        this.hexo.extend.tag.register('code', this._tag, { async: true });
    }
}

module.exports.IncludeCodeTag = IncludeCodeTag;
