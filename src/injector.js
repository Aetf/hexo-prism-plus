'use strict';

const pathFn = require('path');
const fs = require('fs');

function prismFiles(base, plugins, ext) {
    return plugins
        // map plugin name to path within repo, eg
        // line-numbers => plugins/line-numbers/prism-line-numbers.min.js
        .map(p => pathFn.join('plugins', p, `prism-${p}.${ext}`))
        // only take existing ones
        .filter(p => fs.existsSync(pathFn.join(base, p)));
}

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

    // get a list of plugins js files
    // they may or may not exist, so check our locally installed copy
    const base = pathFn.dirname(require.resolve('prismjs/package.json'));
    const version = require(pathFn.join(base, 'package.json')).version;

    const pluginStyles = prismFiles(base, plugins, 'min.css')
        // append the vender base url and version
        .map(p => pathFn.join(vendor_base_url, version, p));

    const pluginScripts = prismFiles(base, plugins, 'min.js')
        // append the vender base url and version
        .map(p => pathFn.join(vendor_base_url, version, p));

    return [
        [
            pathFn.join(vendor_base_url, version, 'themes', `${theme}.min.css`),
            ...pluginStyles,
        ],[
            pathFn.join(vendor_base_url, version, 'prism.min.js'),
            ...pluginScripts,
        ]
    ]
}

Injector.prototype._injectJs = function() {
    if (!this.opts.enable) {
        return;
    }

    const { hexo, scripts } = this;
    const js = hexo.extend.helper.get('js').bind(hexo);

    return [
        ...scripts,
        '/assets/prism-plus.js',
    ].map(js).join('\n');
}

Injector.prototype._injectCss = function() {
    if (!this.opts.enable) {
        return;
    }

    const { hexo, styles } = this;
    const css = hexo.extend.helper.get('css').bind(hexo);

    return styles.map(css).join('\n');
}

Injector.prototype.register = function () {
    var { hexo, _injectJs, _injectCss } = this;

    hexo.extend.injector.register('head_end', _injectCss.bind(this));
    hexo.extend.injector.register('body_end', _injectJs.bind(this));
};

module.exports = Injector;
