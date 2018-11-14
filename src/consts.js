'use strict';

const pathFn = require('path');

module.exports.PRISM_MARKER = '<!-- Has Prism -->';

module.exports.CODE_BLOCK_TEMPLATE_PATH = pathFn.resolve(__dirname, '../assets/codeblock.swig');

module.exports.LINENO_CLASS = 'line-numbers';

const DEFAULT_VENDORS = {
    // string or list
    base_url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/',
    prism: [
        'prism.min.js',
        'plugins/line-numbers/prism-line-numbers.min.js',
        'plugins/normalize-whitespace/prism-normalize-whitespace.min.js'
    ],
    // string or list
    prism_css: [
        'themes/prism.min.css',
        'plugins/line-numbers/prism-line-numbers.min.css'
    ]
};
module.exports.DEFAULT_VENDORS = DEFAULT_VENDORS;

module.exports.DEFAULT_OPTIONS = {
    enable: true,
    vendors: DEFAULT_VENDORS,
    default_lang: 'clike',
    default_preset: {
        lineno: true,
        classes: '',
    },
    presets: {
    }
};