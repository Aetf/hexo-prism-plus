'use strict';

module.exports.PRISM_MARKER = '<!-- Has Prism -->';

module.exports.CODE_BLOCK_REGEX = /<code>/i;

module.exports.LINENO_CLASS = 'line-numbers';

module.exports.DEFAULT_OPTIONS = {
    enable: true,
    vendors: {
        // string or list
        prism: [
            'https://cdnjs.cloudflare.com/ajax/libs/prism/1.8.4/prism.min.js',
        ],
        // string or list
        prism_css: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.8.4/themes/prism.min.css',
    },
    default_lang: 'clike',
    default_preset: {
        lineno: true,
        classes: '',
    },
    presets: {
    }
};