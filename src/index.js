'use strict';

/* global hexo */

const { PRISM_MARKER } = require('./consts');
const { getOptions } = require('./option');
const BacktickCodeBlockFilter = require('./filter/backtick_code_block');
const CodeTagPlugin = require('./tag/include_code');
const Injector = require('./injector/injector.js')

function register(hexo) {
    var opts = getOptions(hexo);
    
    new Injector(hexo, opts).register();
    new BacktickCodeBlockFilter(hexo, opts).register();
    new CodeTagPlugin(hexo, opts).register();
}

register(hexo);