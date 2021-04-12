'use strict';

/* global hexo */

const { getOptions } = require('./option');
const { BacktickCodeBlockFilter } = require('./code_block');
const { IncludeCodeTag } = require('./code_tag');
const Injector = require('./injector');
const { PrismPlusGenerator } = require('./generator');
const { PrismHighlighter } = require('./highlighter');

function register(hexo) {
    const opts = getOptions(hexo.config.prism_plus);
    const highlighter = new PrismHighlighter(hexo, opts);

    new Injector(hexo, opts).register();
    new PrismPlusGenerator(hexo, opts, highlighter).register();

    new BacktickCodeBlockFilter(hexo, opts, highlighter).register();
    new IncludeCodeTag(hexo, opts, highlighter).register();
}

register(hexo);
