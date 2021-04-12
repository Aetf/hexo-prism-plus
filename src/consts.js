'use strict';

const pathFn = require('path');

module.exports.LINENO_CLASS = 'line-numbers';

module.exports.SELF = pathFn.resolve(__dirname, '..');

module.exports.DEFAULT_OPTIONS = {
    enable: true,
    vendor_base_url: 'https://cdnjs.cloudflare.com/ajax/libs/prism',
    plugins: [
    ],
    theme: 'prism',
    default_lang: 'clike',
    presets: {
        default: {
        }
    }
};
