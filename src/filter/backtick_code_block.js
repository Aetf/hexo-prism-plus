'use strict';

const util = require('hexo-util');
const _ = require('lodash');

const PrismConfig = require('./prism_config');

const rBacktick = new Regexp([
    /^(\s*)/                  // begining white spaces
    , /(~{3,}|`{3,})(.*)\n/   // opening ``` or ~~~ with any options
    , /([\s\S]*?)/           // code content, lazy match
    , /^\s*\2(\s*)$/          // closing ``` or ~~~ with trailing white spaces
].map(function (r) { return r.source; }), 'gm');

function BacktickCodeBlockFilter(hexo, opts) {
    this.hexo = hexo;
    this.opts = opts;
}

BacktickCodeBlockFilter.prototype._transform = function (data) {
    var hexo = this.hexo;
    var opts = this.opts;
    if (!opts.enable) return;

    data.content = data.content.replace(rBacktick, function() {
        var start = arguments[1];
        var end = arguments[5];
        var args = arguments[3]
        var code = arguments[4];

        var locals = this._prepareLocals(args, code);
        var content = hexo.render.renderSync({ path: '../../assets/codeblock.swig' }, locals);

        return start + '<escape>' + content + '</escape>' + (end ? '\n\n' : '');
    });
}

BacktickCodeBlockFilter.prototype._prepareLocals = function (args, code) {
    var opts = this.opts;
    var lang = opts.default_lang || 'none';

    args = _.trim(args).split(' ');
    if (args[0].indexOf('=') == -1) {
        // treat it as lang
        lang = args.shift();
    }

    locals = {
        lang: lang,
        code: util.escapeHTML(code)
    };

    var pconfig = new PrismConfig(opts);
    pconfig.update(args);

    locals.pre_class = pconfig.pre_class();
    locals.pre_style = pconfig.pre_style();
    locals.data_attr = pconfig.data_attr();

    return locals;
}

BacktickCodeBlockFilter.prototype.register = function() {
    var hexo = this.hexo;
    var opts = this.opts;

    hexo.extend.filter.register('before_post_render', this._transform.bind(this));
}

module.exports = BacktickCodeBlockFilter;