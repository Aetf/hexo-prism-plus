'use strict';

const test = require('ava');
const { setupSandbox, fake } = require('./helpers');

const { BacktickCodeBlockFilter } = require('../src/code_block');
const { getOptions } = require('../src/option');


setupSandbox(test);

test.beforeEach(async t => {
    t.context.highlighter = {
        highlight: fake('')
    };

    t.context.filter = new BacktickCodeBlockFilter(t.context.hexo, getOptions({}), t.context.highlighter);
});

test('backtick code block accepts ```', t => {
    const { highlighter, filter } = t.context;

    const content = `
    \`\`\` clang:abc styles=max-height:30em classes=classA,classB preset=presetD    
    int main() { return 0; }
    \`\`\`
    `;

    filter._transform({ content });

    t.is(highlighter.highlight.store.length, 1);
    t.deepEqual(highlighter.highlight.store[0].calledArguments, [
            '    int main() { return 0; }\n',
            ['clang:abc', 'styles=max-height:30em', 'classes=classA,classB', 'preset=presetD']
        ]
    );
});

test('backtick code block accepts ~~~', t => {
    const { highlighter, filter } = t.context;

    const content = `
    ~~~ clang:abc styles=max-height:30em classes=classA,classB preset=presetD    
    int main() { return 0; }
    ~~~
    `;

    filter._transform({ content });

    t.is(highlighter.highlight.store.length, 1);
    t.deepEqual(highlighter.highlight.store[0].calledArguments, [
            '    int main() { return 0; }\n',
            ['clang:abc', 'styles=max-height:30em', 'classes=classA,classB', 'preset=presetD']
        ]
    );
});

test('backtick code block preserves white space', t => {
    const { highlighter, filter } = t.context;

    const data = {}
    data.content = `    ~~~ clang:abc styles=max-height:30em classes=classA,classB preset=presetD    
    int main() { return 0; }
    ~~~   
    `;

    filter._transform(data);

    t.is(highlighter.highlight.store.length, 1);
    t.is(data.content, '    <hexoPostRenderCodeBlock></hexoPostRenderCodeBlock>   \n    ');
});
