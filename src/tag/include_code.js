'use strict';

const pathFn = require('path');
const fs = require('hexo-fs');
const { prepareLocals } = require('../prism_config');
const { CODE_BLOCK_TEMPLATE_PATH } = require('../consts');

/**
 * Include code tag
 *
 * Synctax:
 *     {% includecode /path/to/file [inline options]%}
 */
function IncludeCodeTag(hexo, opts) {
    this.hexo = hexo;
    this.opts = opts;
}

IncludeCodeTag.prototype._tag = function(args) {
    const hexo = this.hexo;
    const opts = this.opts;
    const codeDir = this.hexo.config.code_dir;

    if (!opts.enable) return;

    var path = args.shift();
    // Exit if path is not defined
    if (!path) return;
    const src = pathFn.join(hexo.source_dir, codeDir, path);

    hexo.log.info('args is ' + args);
    var arg = args.join(' ');

    return fs.exists(src).then(function(exist) {
        hexo.log.info('file exists: ' + exist);
        if (exist) return fs.readFile(src);
    }).then(function(code) {
        if (!code) return;

        hexo.log.info('prepareing locals with arg: ' + arg);
        var locals = prepareLocals(opts, arg, code);

        hexo.log.info('rendering');
        return hexo.render.render({ path: CODE_BLOCK_TEMPLATE_PATH }, locals);
    });
};

IncludeCodeTag.prototype.register = function() {
    this.hexo.extend.tag.register('includecode', this._tag.bind(this), {async: true});
};

module.exports = IncludeCodeTag;