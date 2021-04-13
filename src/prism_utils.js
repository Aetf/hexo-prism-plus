'use strict';

const pathFn = require('path');
const fs = require('fs');

const _ = require('lodash');

const { LINENO_CLASS } = require('./consts');

class PrismArgs {
    constructor(opts, args) {
        const { default_lang, presets } = opts;
        this.lang = default_lang || 'none';
        if (args.length > 0 && args[0].indexOf('=') == -1) {
            // treat it as lang if it is not empty
            this.lang = args.shift() || this.lang;
        }

        // process key=value pairs in args
        const [presetTerms, otherTerms] = _.chain(args)
            .map(term => term.split(/=(.+)/, 2))
            .partition(([key]) => key === 'preset')
            .value();

        // preset=xxx takes precedence, process them first in order
        presetTerms.unshift(['preset', 'default']);
        for (const [, preset] of presetTerms) {
            if (_.isUndefined(presets[preset])) {
                continue;
            }
            // preset resets all previous state
            this.classes = new Set();
            this.styles = [];
            this.dataAttrs = {};
            this.dependencies = new Set();
            for (const [key, value] of _.toPairs(presets[preset])) {
                this._set(key, value);
            }
        }

        // process other terms
        for (const [key, value] of otherTerms) {
            this._set(key, value);
        }
    }

    _set = (key, value) => {
        switch (key) {
            case 'lineno':
                if (String(value).toLowerCase() == "true") {
                    this.classes.add(LINENO_CLASS);
                } else {
                    this.classes.delete(LINENO_CLASS);
                }
                break;
            case 'max-height':
                this.styles.apend(`${key}: ${value}`);
                break;
            case 'dependencies':
            case 'classes':
                if (!Array.isArray(value)) {
                    value = value.split(',');
                }
                for (const elm of value) {
                    this[key].add(elm);
                }
                break;
            case 'styles':
                if (_.isString(value)) {
                    value = value.split(';');
                } else {
                    value = _.toPairs(value).map(([sk, sv]) => `${sk}: ${sv}`);
                }
                for (const sty of value) {
                    this.styles.push(sty);
                }
                break;
            default:
                this.dataAttrs[key] = _.toString(value);
                break;
        }
    }

    get preClass() {
        return _.toArray(this.classes).join(' ');
    }

    get preStyle() {
        return this.styles.join(';');
    }

    get preDataAttr() {
        return _.toPairs(this.dataAttrs)
            .map(([key, value]) => `data-${key}="${_.escape(value)}"`)
            .join(' ');
    }
}

class PrismUtils {
    constructor() {
        this.base = pathFn.dirname(require.resolve('prismjs/package.json'));
        this.version = require(pathFn.join(this.base, 'package.json')).version;
    }

    get runtimePlugins() {
        if (_.isUndefined(this._runtimePlugins)) {
            this.loadData();
        }
        return this._runtimePlugins;
    }

    get langAliases() {
        if (_.isUndefined(this._langAliases)) {
            this.loadData();
        }
        return this._langAliases;
    }

    get langDependencies() {
        if (_.isUndefined(this._langDependencies)) {
            this.loadData();
        }
        return this._langDependencies;
    }

    get prismMeta() {
        if (_.isUndefined(this._prismMeta)) {
            this.loadData();
        }
        return this._prismMeta;
    }

    // load language dependency data
    loadData = () => {
        const data = require(pathFn.join(this.base, 'components.json'));
        this._langAliases = {};
        this._langDependencies = {};
        this._runtimePlugins = new Set();
        this._prismMeta = {
            plugins: data.plugins.meta,
            languages: data.languages.meta,
            themes: data.themes.meta,
            core: data.core.meat,
        };

        for (const key in data.languages) {
            if (key === 'meta') {
                continue;
            }
            const language = data.languages[key];
            if (language.alias) {
                const aliases = _.isString(language.alias) ? [language.alias] : language.alias;
                for (const alias of aliases) {
                    this._langAliases[alias] = key;
                }
            }
            if (language.require) {
                const requires = _.isString(language.require) ? [language.require] : language.require;
                this._langDependencies[key] = requires;
            }
        }

        // plugins need to run in browser
        const plugins = _.chain(data.plugins).keys().without('meta').value();
        const pluginFiles = this.pluginFiles(plugins, '.js');
        if (plugins.length !== pluginFiles.length) {
            throw new Error('Corrupted prismjs files');
        }
        for (const [plugin, file] of _.zip(plugins, pluginFiles)) {
            const content = fs.readFileSync(pathFn.join(this.base, file));
            if (content.includes('addEventListener')) {
                this._runtimePlugins.add(plugin);
            }
        }

        // additionally all plugins depending on toolbar need to run in browser
        _.chain(data.plugins)
            .pickBy(plugin => plugin.require === 'toolbar')
            .keys()
            .forEach(p => this._runtimePlugins.add(p))
            .commit();
    }

    prismFiles = (type, list, ext) => {
        const { base, prismMeta } = this;
        ext = ext || '';
        return _.toArray(list)
            // map plugin name to path within repo, eg
            // line-numbers => plugins/line-numbers/prism-line-numbers.js
            .map(p => prismMeta[type].path.replace(/\{id\}/g, p) + ext)
            // only take existing ones
            .filter(p => fs.existsSync(pathFn.join(base, p)));
    }

    // resolve plugin files
    pluginFiles = (plugins, ext) => {
        return this.prismFiles('plugins', plugins, ext);
    }

    componentFiles = (langs) => {
        return this.prismFiles('languages', langs, '.min.js');
    }

    themeFiles = (themes) => {
        return this.prismFiles('themes', themes, '');
    }

    coreFile = () => {
        return this._prismMeta.core.path;
    }

    isRuntimePlugin = (plugin) => {
        return this.runtimePlugins.has(plugin);
    }

    // resolve a array of all dependencies, including dependencies of dependencies.
    // sorted in topo order
    allDependencies = (lang, deps) => {
        const { langAliases, langDependencies } = this;

        // first, we save in reverse order, for ease of processing
        let topo = [lang, ..._.without(_.toArray(deps), lang)];

        // then resolve alias
        topo = topo
            // we don't care force loading
            .map(id => id.replace('!', ''))
            .map(id => langAliases[id] || id)
            .filter(id => id !== 'none');

        // remember already visited ones
        const visited = new Set(topo);

        for (let id of topo) {
            // append any new dependencies
            for (let d of langDependencies[id] || []) {
                // resolve alias
                d = langAliases[d] || d;

                if (visited.has(d)) {
                    continue;
                }
                topo.push(d);
                visited.add(d);
            }
        }

        return topo.reverse();
    }
}

module.exports.PrismArgs = PrismArgs;
module.exports.PrismUtils = PrismUtils;
module.exports.prismUtils = new PrismUtils();
