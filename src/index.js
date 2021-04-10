'use strict';

/* global hexo */

const { getOptions } = require('./option');
const { BacktickCodeBlockFilter } = require('./backtick_code_block');
const { IncludeCodeTag } = require('./includecode_tag');
const Injector = require('./injector');
const { PrismPlusGenerator } = require('./generator');
const { PrismHighlighter } = require('./highlighter');

function register(hexo) {
    const opts = getOptions(hexo);

    new Injector(hexo, opts).register();
    new PrismPlusGenerator(hexo, opts).register();

    const highlighter = new PrismHighlighter(hexo, opts);
    new BacktickCodeBlockFilter(hexo, opts, highlighter).register();
    new IncludeCodeTag(hexo, opts, highlighter).register();
}

register(hexo);
