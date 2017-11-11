'use strict';

const { prepareLocals } = require('../prism_config');
const { CODE_BLOCK_TEMPLATE_PATH } = require('../consts');

const rBacktick = new RegExp([
    /^(\s*)/                  // begining white spaces
    , /(~{3,}|`{3,})(.*)\n/   // opening ``` or ~~~ with any options
    , /([\s\S]*?)/           // code content, lazy match
    , /^\s*\2(\s*)$/          // closing ``` or ~~~ with trailing white spaces
].map(function (r) { return r.source; }).join(''), 'gm');

function BacktickCodeBlockFilter(hexo, opts) {
    this.hexo = hexo;
    this.opts = opts;
}

BacktickCodeBlockFilter.prototype._transform = function (data) {
    var hexo = this.hexo;
    var opts = this.opts;
    if (!opts.enable) return;

    hexo.log.info('BacktickCodeBlockFilter _transform');

    data.content = data.content.replace(rBacktick, function() {
        hexo.log.info('BacktickCodeBlockFilter _transform detected code block');
        var start = arguments[1];
        var end = arguments[5];
        var args = arguments[3];
        var code = arguments[4];

        var locals = prepareLocals(opts, args, code);
        var content = hexo.render.renderSync({ path: CODE_BLOCK_TEMPLATE_PATH }, locals);

        return start + '{% raw %}\n' + content + '{% endraw %}\n' + (end ? '\n\n' : '');
    });
}

BacktickCodeBlockFilter.prototype.register = function() {
    var hexo = this.hexo;
    var opts = this.opts;

    hexo.extend.filter.register('before_post_render', this._transform.bind(this));
}

module.exports = BacktickCodeBlockFilter;