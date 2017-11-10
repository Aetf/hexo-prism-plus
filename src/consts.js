'use strict';

const pathFn = require('path');

module.exports.PRISM_MARKER = '<!-- Has Prism -->';

module.exports.CODE_BLOCK_TEMPLATE_PATH = pathFn.resolve(__dirname, '../assets/codeblock.swig');

module.exports.LINENO_CLASS = 'line-numbers';

module.exports.DEFAULT_OPTIONS = {
    enable: true,
    vendors: {
        // string or list
        prism: [
            'https://cdnjs.cloudflare.com/ajax/libs/prism/1.8.4/prism.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/prism/1.8.4/plugins/line-numbers/prism-line-numbers.min.js'
        ],
        // string or list
        prism_css: [
            'https://cdnjs.cloudflare.com/ajax/libs/prism/1.8.4/themes/prism.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/prism/1.8.4/plugins/line-numbers/prism-line-numbers.min.css'
        ]
    },
    default_lang: 'clike',
    default_preset: {
        lineno: true,
        classes: '',
    },
    presets: {
    }
};