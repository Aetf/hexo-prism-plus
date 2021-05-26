'use strict';

// this runs in browser to hydrate any ssr prism code block
// by reruning 'after-highlight' and 'complete' hook
(() => {
    document.querySelectorAll("[data-prism-hydrate]").forEach(function(el) {
        let env = JSON.parse(el.getAttribute('data-prism-hydrate'));
        // hydrate the env
        env.element = el;
        env.grammar = Prism.languages[env.language];
        if (!env.grammar) {
            return;
        }
        // rerun the hooks
        Prism.hooks.run('after-highlight', env);
        Prism.hooks.run('complete', env);

        // done, remove the saved env attribute
        el.setAttribute('data-prism-hydrate', '');
    });
})();
