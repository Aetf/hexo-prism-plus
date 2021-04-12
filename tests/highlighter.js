'use strict';

const test = require('ava');
const { setupSandbox } = require('./helpers');

const { JSDOM } = require('jsdom');

const { PrismHighlighter } = require('../src/highlighter');
const { getOptions } = require('../src/option');

setupSandbox(test);

test('code is highlighted', async t => {
    const { hexo } = t.context;
    const highlighter = new PrismHighlighter(hexo, getOptions({}));

    const code = `
    int main() {
        return 0;
    }
    `;

    const rendered = highlighter.highlight(code, []);

    const frag = JSDOM.fragment(rendered);

    t.assert(frag.querySelectorAll('span.token').length > 0);
});

test('toolbar plugin is rendered', async t => {
    const { hexo } = t.context;
    const highlighter = new PrismHighlighter(hexo, getOptions({
        plugins: ['toolbar']
    }));

    const code = `
    int main() {
        return 0;
    }
    `;

    const rendered = highlighter.highlight(code, ['label=abc']);

    const frag = JSDOM.fragment(rendered);

    t.like(frag.querySelector('.code-toolbar .toolbar .toolbar-item span'), {
        textContent: 'abc'
    });
});

test('line-numbers plugin is rendered', async t => {
    const { hexo } = t.context;
    const highlighter = new PrismHighlighter(hexo, getOptions({
        plugins: ['line-numbers']
    }));

    const code = `
    int main() {
        return 0;
    }
    `;

    const rendered = highlighter.highlight(code, ['lineno=true']);

    const frag = JSDOM.fragment(rendered);

    t.assert(frag.querySelector('pre'));
    t.regex(frag.querySelector('pre').className, /line-numbers/);

    t.assert(frag.querySelector('.line-numbers-rows'));
});

test('command line is rendered', async t => {
    const { hexo } = t.context;
    const highlighter = new PrismHighlighter(hexo, getOptions({
        plugins: ['command-line']
    }));

    const code = `
    mkdir build && cd build
    cmake -DCMAKE_PREFIX_PATH=~/stage/lib64/cmake \
                            -DCMAKE_BUILD_TYPE=Debug \
                            -DCMAKE_INSTALL_PREFIX=~/stage \
                            ..
    make install
    `;

    const rendered = highlighter.highlight(code, ['bash', 'output=3-5', 'classes=command-line', 'user=aetf']);

    const frag = JSDOM.fragment(rendered);

    t.assert(frag.querySelector('.command-line-prompt'));
});

test('non default language is rendered', async t => {
    const { hexo } = t.context;
    const highlighter = new PrismHighlighter(hexo, getOptions({}));

    const code = `
    mkdir build && cd build
    cmake -DCMAKE_PREFIX_PATH=~/stage/lib64/cmake \
                            -DCMAKE_BUILD_TYPE=Debug \
                            -DCMAKE_INSTALL_PREFIX=~/stage \
                            ..
    make install
    `;

    const rendered = highlighter.highlight(code, ['bash']);

    const frag = JSDOM.fragment(rendered);

    t.assert(frag.querySelector('span.token'));
})
