'use strict'

const pathFn = require('path');
const fs = require('fs');

const _ = require('lodash');

const { SELF } = require('./consts');
const { prismUtils } = require('./prism_utils');

class PrismPlusGenerator {
    constructor(hexo, opts, highlighter) {
        this.hexo = hexo;
        this.opts = opts;
        this.highlighter = highlighter;
    }

    _generate = locals => {
        if (!this.opts.enable) {
            return [];
        }
        return [
            // this is included on every page, and should be evaluated only once (i.e. no data-pjax)
            {
                path: '/assets/prism-bundle.js',
                data: this._generatePrismBundle
            },
            // this is also on every page, but should be called after every pjax load
            {
                path: '/assets/prism-plus.js',
                data: () => fs.createReadStream(pathFn.join(SELF, 'client', 'prism-plus.js'))
            },
        ]
    }

    _generatePrismBundle = async () => {
        // generate a prism bundle that loads necessary plugins and langs
        const { hexo, opts, highlighter } = this;
        const runtimePlugins = opts.plugins.filter(p => prismUtils.isRuntimePlugin(p));

        hexo.log.debug('hexo-prism-plus: load prism runtime plugins ', runtimePlugins);

        const files = [
            prismUtils.coreFile(),
            ...prismUtils.componentFiles(highlighter.loadedLanguages),
            ...prismUtils.pluginFiles(runtimePlugins, '.min.js'),
        ];
        const contents = await Promise.all(
            files.map(file => fs.promises.readFile(pathFn.join(prismUtils.base, file), 'utf-8'))
        );
        const lines = _.zip(contents, files)
            .flatMap(([content, file]) => [`/* ${file} */`, content]);
        lines.unshift('"use strict";\nwindow.Prism=window.Prism||{};window.Prism.manual=true');
        return lines.join('\n');
    }

    register() {
        const { hexo } = this;
        hexo.extend.generator.register('prism-plus', this._generate);
    }
}

module.exports.PrismPlusGenerator = PrismPlusGenerator;
