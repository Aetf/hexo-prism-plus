'use strict';

// this runs in browser to hydrate any ssr prism code block
// by reruning 'after-highlight' and 'complete' hook
(() => {
    document.querySelectorAll("[data-prism-hydrate]").forEach(function(el) {
        let env = JSON.parse(el.textContent);
        if (env.element !== el.getAttribute('data-prism-hydrate')) {
            console.log('Mismatched prism hydrate ID');
            return;
        }
        env.element = document.getElementById(env.element);
        if (env.element == null) {
            return;
        }
        Prism.hooks.run('after-highlight', env);
        Prism.hooks.run('complete', env);

        if (el.parentElement) {
            el.parentElement.removeChild(el);
        }
    });
})();
