'use strict'

const pathFn = require('path');
const fs = require('fs');
const vm = require('vm');

const { JSDOM } = require('jsdom');
const _ = require('lodash');

const { idGen } = require('./id_gen');
const { prismUtils, PrismArgs } = require('./prism_utils');

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
        hexo.log.debug('hexo-prism-plus: parsed args', parsed.lang, parsed.classes, parsed.styles, parsed.dataAttrs);
        return {
            ..._.pick(parsed, ['preClass', 'preStyle', 'preDataAttr', 'lang', 'dependencies']),
        };
    }

    highlight = (code, args) => {
        const { opts, dom, nextId } = this;

        // pre render to jsdom
        const {preClass, preStyle, preDataAttr, lang, dependencies} = this.parseArgs(args);
        const codeId = nextId();
        const html = [
            `<div id="container-${codeId}">`,
            `<pre class="${preClass}" style="${preStyle}" ${preDataAttr}>`,
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

module.exports.PrismHighlighter = PrismHighlighter;
