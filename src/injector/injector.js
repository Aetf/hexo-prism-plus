'use strict';

const { PRISM_MARKER, CODE_BLOCK_REGEX } = require('../consts');

function Injector(hexo, opts) {
    this.hexo = hexo;
    this.opts = opts;
}

Injector.prototype._shouldInject = function (src) {
    return src.indexOf(PRISM_MARKER) >= 0 || CODE_BLOCK_REGEX.test(src);
}

Injector.prototype._inject = function (inject) {
    var opts = {
        inline: true,
        shouldInject: this._shouldInject.bind(this)
    };
    const vendors = this.opts.vendors;

    vendors.prism.forEach(function(js) {
        inject.bodyEnd.script({ src: js }, '', opts);
    }, this);

    vendors.prism_css.forEach(function (css) {
        inject.headEnd.link({ rel: 'stylesheet', href: css}, opts);
    }, this);
};

Injector.prototype.register = function () {
    var { hexo, opts, _inject } = this;

    hexo.extend.filter.register('inject_ready', _inject.bind(this));
};

module.exports = Injector;