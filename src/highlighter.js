'use strict'

const pathFn = require('path');
const fs = require('fs');
const vm = require('vm');
const Module = require('module');

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
        this.runPrism = this.preparePrism();
    }

    // load prism in dom, and return a method to highlight code in dom
    preparePrism = () => {
        const { hexo, dom, opts } = this;

        const context = dom.getInternalVMContext();
        context.__load = id => {
            // similar to CJS require in jsdom
            // difference is that we always use require from the outside context
            const fullPath = require.resolve(id);
            hexo.log.debug('hexo-prism-plus: loading dom script %s', fullPath);

            const m = { exports: {} };
            m.id = m.filename = fullPath;

            const content = fs.readFileSync(fullPath);
            const script = `(function(exports, module, __filename, __dirname){${content}\n});`;
            const fn = vm.runInContext(script, context, fullPath);
            fn(m.exports, m, fullPath, pathFn.dirname(fullPath));
            return m.exports;
        };

        const { preparePrismInDom, runPrismInDom } = context.__load('./dom/prismInDom');

        this.loadedLanguages = preparePrismInDom(opts.plugins.map(p => pathFn.join('prismjs', 'plugins', p, `prism-${p}`)));
        return runPrismInDom;
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
        const allDeps = prismUtils.allDependencies(lang, dependencies);
        const prismEnv = this.runPrism(codeId, allDeps);

        const container = dom.window.document.getElementById(`container-${codeId}`);

        // serialize prismEnv to JSON
        // replace element to its id so it can be serialized
        prismEnv.element = prismEnv.element.id;
        delete prismEnv.grammar;

        // attach the serlized prismEnv to the pre
        const prismEnvElm = dom.window.document.createElement('script');
        prismEnvElm.setAttribute('data-prism-hydrate', codeId);
        prismEnvElm.type = 'application/json';
        prismEnvElm.textContent = JSON.stringify(prismEnv)
            .replace('<', `\\u003c`)
            .replace('>', '\\u003e')
            .replace('&', '\\u0026')
            .replace("'", '\\u0027');
        container.appendChild(prismEnvElm);

        // XXX: it's not yet possible to statically generate toolbar, which mixes dom creation and
        // event listener attaching
        // remove the created toolbar container
        const toolbar = container.querySelector('div.code-toolbar');
        if (toolbar) {
            const pre = toolbar.querySelector('pre');
            container.appendChild(pre);
            container.removeChild(toolbar);
        }

        const rendered = container.innerHTML;

        // cleanup
        container.remove();

        return { rendered, allDeps };
    }
}

module.exports.PrismHighlighter = PrismHighlighter;
