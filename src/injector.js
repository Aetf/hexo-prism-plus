'use strict';

const pathFn = require('path');

const _ = require('lodash');

const { prismUtils } = require('./prism_utils');

function Injector(hexo, opts) {
    this.hexo = hexo;
    this.opts = opts;

    if (this.opts.enable) {
        [this.styles, this.scripts] = this._resolvePrism();
    }
}

Injector.prototype._resolvePrism = function() {
    const {
        vendor_base_url,
        plugins,
        theme,
    } = this.opts;

    const venderUrl = (...parts) => pathFn.join(vendor_base_url, prismUtils.version, ...parts);

    // get a list of css/js files
    // they may or may not exist, so check our locally installed copy

    // plugin/component js files are bundled and loaded in prism-bundle.js
    return [
        [
            ...prismUtils.themeFiles([theme], '.css').map(_.unary(venderUrl)),
            ...prismUtils.pluginFiles(plugins, '.css').map(_.unary(venderUrl))
        ],[
            venderUrl('prism.min.js'),
        ]
    ]
}

Injector.prototype._injectJs = function() {
    if (!this.opts.enable) {
        return;
    }

    const { hexo, scripts } = this;
    const js = hexo.extend.helper.get('js').bind(hexo);

    return js(scripts,
        {
            src: '/assets/prism-bundle.js',
        },
        {
            src: '/assets/prism-plus.js',
            'data-pjax': '',
        }
    );
}

Injector.prototype._injectCss = function() {
    if (!this.opts.enable) {
        return;
    }

    const { hexo, styles } = this;
    const css = hexo.extend.helper.get('css').bind(hexo);

    return css(styles);
}

Injector.prototype.register = function () {
    var { hexo, _injectJs, _injectCss } = this;

    hexo.extend.injector.register('head_end', _injectCss.bind(this));
    hexo.extend.injector.register('body_end', _injectJs.bind(this));
};

module.exports = Injector;
