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

    // load language dependency data
    loadData = () => {
        const data = require(pathFn.join(this.base, 'components.json'));
        this._langAliases = {};
        this._langDependencies = {};

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
    }

    // resolve plugin files
    pluginFiles = (plugins, ext) => {
        const { base } = this;
        return plugins
            // map plugin name to path within repo, eg
            // line-numbers => plugins/line-numbers/prism-line-numbers.min.js
            .map(p => pathFn.join('plugins', p, `prism-${p}.${ext}`))
            // only take existing ones
            .filter(p => fs.existsSync(pathFn.join(base, p)));
    }

    // resolve a array of all dependencies, including dependencies of dependencies.
    // sorted in topo order
    allDependencies = (lang, deps) => {
        const { langAliases, langDependencies } = this;

        // first, we save in reverse order, for ease of processing
        const topo = [lang, ..._.without(deps, lang)];
        const visited = new Set(topo);

        for (let id of topo) {
            // we don't care force loading
            id = id.replace('!', '');
            // resolve alias
            id = langAliases[id] || id;
            // append any new dependencies
            for (const d of langDependencies[id] || []) {
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
