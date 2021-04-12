'use strict'

const pathFn = require('path');
const fs = require('fs');
const vm = require('vm');

const { JSDOM } = require('jsdom');
const _ = require('lodash');

const { LINENO_CLASS } = require('./consts');
const { idGen } = require('./id_gen');

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
            this._classes = new Set();
            this._styles = [];
            this._dataAttr = {};
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
        if (key === 'lineno') {
            if (String(value).toLowerCase() == "true") {
                this._classes.add(LINENO_CLASS);
            } else {
                this._classes.delete(LINENO_CLASS);
            }
        } else if (key === 'max-height') {
            this._styles.apend(`${key}: ${value}`);
        } else if (key === 'classes') {
            if (!Array.isArray(value)) {
                value = value.split(',');
            }
            for (const clz of value) {
                this._classes.add(clz);
            }
        } else if (key === 'styles') {
            if (_.isString(value)) {
                value = value.split(';');
            } else {
                value = _.toPairs(value).map(([sk, sv]) => `${sk}: ${sv}`);
            }
            for (const sty of value) {
                this._styles.push(sty);
            }
        } else {
            this._dataAttr[key] = _.toString(value);
        }
    }

    get preClass() {
        return _.toArray(this._classes).join(' ');
    }

    get preStyle() {
        return this._styles.join(';');
    }

    get dataAttr() {
        return _.toPairs(this._dataAttr)
            .map(([key, value]) => `data-${key}="${_.escape(value)}"`)
            .join(' ');
    }
}

class PrismHighlighter {
    constructor(hexo, opts) {
        this.hexo = hexo;
        this.opts = opts;
        this.nextId = idGen();
        this.dom = new JSDOM('', { runScripts: 'outside-only' });
        this.savedPrismEnv = this.preparePrism();
    }

    // load prism in dom, and return a dict having saved prismenv in prismenv[codeId]
    preparePrism = () => {
        const { hexo, dom, opts } = this;

        const context = dom.getInternalVMContext();
        context.__load = id => {
            // a function to load code similar to the browser environment
            const fullPath = require.resolve(id);
            hexo.log.debug('hexo-prism-plus: loading dom script %s', fullPath);
            const script = new vm.Script(fs.readFileSync(fullPath), fullPath);
            script.runInContext(context);
        };

        const loadPlugins = opts.plugins
            .map(p => pathFn.join('prismjs', 'plugins', p, `prism-${p}`))
            .map(p => `__load('${p}')`)
            .join(';\n');

        const script = new vm.Script(`
        (() => {
            window.Prism = { manual: true };
            __load('prismjs');
            let prismEnv = {};
            Prism.hooks.add('after-highlight', env => {
                prismEnv[env.element.id] = env;
            });
            ${loadPlugins};
            return prismEnv;
        })()
        `, 'hexo-prism-plus/preparePrism.js');
            // Prism.highlightElement(document.getElementById('${codeId}'));

        return script.runInContext(context);
    }

    parseArgs = args => {
        const { hexo, opts } = this;

        hexo.log.debug('hexo-prism-plus: parsing args: %s', args);
        const parsed = new PrismArgs(opts, args);
        hexo.log.debug('hexo-prism-plus: parsed args', parsed.lang, parsed._classes, parsed._styles, parsed._dataAttr);
        return parsed;
    }

    highlight = (code, args) => {
        const { opts, dom, nextId } = this;

        // pre render to jsdom
        const {preClass, preStyle, dataAttr, lang} = this.parseArgs(args);
        const codeId = nextId();
        const html = [
            `<div id="container-${codeId}">`,
            `<pre class="${preClass}" style="${preStyle}" ${dataAttr}>`,
            `<code id="${codeId}" class="language-${lang}">\n`,
            _.escape(code),
            '</code></pre></div>'
        ].join('');
        dom.window.document.body.insertAdjacentHTML('beforeend', html);

        // run prism on jsdom
        const prismEnv = this.runPrism(codeId);

        // serialize prismEnv to JSON
        // replace element to its id so it can be serialized
        prismEnv.element = prismEnv.element.id;

        // attach the serlized prismEnv to the pre
        const prismEnvElm = dom.window.document.createElement('script');
        prismEnvElm.setAttribute('data-prism-hydrate', codeId);
        prismEnvElm.type = 'application/json';
        prismEnvElm.textContent = JSON.stringify(prismEnv)
            .replace('<', `\\u003c`)
            .replace('>', '\\u003e')
            .replace('&', '\\u0026')
            .replace("'", '\\u0027');

        const container = dom.window.document.getElementById(`container-${codeId}`);
        container.appendChild(prismEnvElm);

        const rendered = container.innerHTML;

        // cleanup
        container.remove();

        return rendered;
    }

    runPrism = (codeId) => {
        const { dom, savedPrismEnv } = this;

        const context = dom.getInternalVMContext();

        const script = new vm.Script(`
            Prism.highlightElement(document.getElementById('${codeId}'));
        `, 'hexo-prism-plus/runPrism.js');

        script.runInContext(context);

        const prismEnv = savedPrismEnv[codeId];
        delete savedPrismEnv[codeId];

        return prismEnv;
    }
}

module.exports.PrismArgs = PrismArgs;
module.exports.PrismHighlighter = PrismHighlighter;
