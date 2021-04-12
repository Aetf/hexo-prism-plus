'use strict';

// this file is evaluated in jsdom

let prismEnv = {};

function preparePrismInDom(plugins) {
    window.Prism = { manual: true };
    window.Prism = __load('prismjs');

    Prism.hooks.add('after-highlight', env => {
        prismEnv[env.element.id] = env;
    });
    for (const plugin of plugins) {
        __load(plugin);
    }
    return prismEnv;
}

let loaded = new Set();
function langLoaded(lang) {
    return (lang in window.Prism.languages) || loaded.has(lang);
}

function loadLanguage(lang) {
    __load(`prismjs/components/prism-${lang}`);
    loaded.add(lang);
}

function runPrismInDom(codeId, allDeps) {
    // load allDeps
    for (const dep of allDeps) {
        if (!langLoaded(dep)) {
            loadLanguage(dep);
        }
    }

    // highlight!
    Prism.highlightElement(document.getElementById(codeId));

    // return saved env in after-highlight hook
    const saved = prismEnv[codeId];
    delete prismEnv[codeId];
    return saved;
}

module.exports.preparePrismInDom = preparePrismInDom;
module.exports.runPrismInDom = runPrismInDom;
