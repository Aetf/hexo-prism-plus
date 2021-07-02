'use strict'

const pathFn = require('path');
const fs = require('fs');

const _ = require('lodash');
const chalk = require('chalk');

const { SELF } = require('./consts');
const { prismUtils } = require('./prism_utils');

/**
 * Generate routes for prism bundle
 */
class PrismPlusGenerator {
    constructor(hexo, opts) {
        this.hexo = hexo;
        this.opts = opts;
    }

    /**
     * Clear old language dependencies
     */
    _before_post_render = post => {
        post._prism_plus_deps = [];
        return post;
    }

    /**
     * Collect prism language dependencies from every post and page,
     * then combine them with plugins defined in config file,
     * finally generate a prism bundle
     */
    _generate = locals => {
        if (!this.opts.enable) {
            return [];
        }
        /**
         * @type {Set<string>}
         */
        const loadedLanguages = new Set();
        locals.posts.forEach(p => (p._prism_plus_deps ?? []).forEach(d => loadedLanguages.add(d)));
        locals.pages.forEach(p => (p._prism_plus_deps ?? []).forEach(d => loadedLanguages.add(d)));

        return [
            // this is included on every page, and should be evaluated only once (i.e. no data-pjax)
            {
                path: '/assets/prism-bundle.js',
                data: () => this._generatePrismBundle(loadedLanguages)
            },
            // this is also on every page, but should be called after every pjax load
            {
                path: '/assets/prism-plus.js',
                data: () => fs.createReadStream(pathFn.join(SELF, 'client', 'prism-plus.js'))
            },
        ]
    }

    /**
     * 
     * @param {Set<string>} loadedLanguages
     * @returns {Promise<string>}
     */
    _generatePrismBundle = async (loadedLanguages) => {
        // generate a prism bundle that loads necessary plugins and langs
        const { hexo, opts } = this;
        const runtimePlugins = opts.plugins.filter(p => prismUtils.isRuntimePlugin(p));

        hexo.log.debug('hexo-prism-plus: load prism runtime plugins ', runtimePlugins);

        const files = [
            prismUtils.coreFile(),
            ...prismUtils.componentFiles(loadedLanguages),
            ...prismUtils.pluginFiles(runtimePlugins, '.min.js'),
        ];
        const contents = await Promise.all(
            files.map(file => {
                hexo.log.info('Prism bundle:', chalk.magenta(file));
                return fs.promises.readFile(pathFn.join(prismUtils.base, file), 'utf-8');
            })
        );
        const lines = _.zip(contents, files)
            .flatMap(([content, file]) => [`/* ${file} */`, content]);
        lines.unshift('"use strict";\nwindow.Prism=window.Prism||{};window.Prism.manual=true');
        return lines.join('\n');
    }

    register() {
        const { hexo } = this;
        // this needs to be higher priority (lower value) to execute before code_block's filter.
        hexo.extend.filter.register('before_post_render', this._before_post_render, 0);
        hexo.extend.generator.register('prism-plus', this._generate);
    }
}

module.exports.PrismPlusGenerator = PrismPlusGenerator;
