'use strict';

const test = require('ava');
const { setupSandbox, fake } = require('./helpers');

const { BacktickCodeBlockFilter } = require('../src/code_block');
const { getOptions } = require('../src/option');


function createPost(content) {
    return {
        content,
        _prism_plus_deps: [],
    };
}


setupSandbox(test);

test.beforeEach(async t => {
    t.context.highlighter = {
        highlight: fake(code => ({ rendered: '', allDeps: []}))
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

    filter._transform(createPost(content));

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

    filter._transform(createPost(content));

    t.is(highlighter.highlight.store.length, 1);
    t.deepEqual(highlighter.highlight.store[0].calledArguments, [
            '    int main() { return 0; }\n',
            ['clang:abc', 'styles=max-height:30em', 'classes=classA,classB', 'preset=presetD']
        ]
    );
});

test('backtick code block preserves white space', t => {
    const { highlighter, filter } = t.context;

    const content = `    ~~~ clang:abc styles=max-height:30em classes=classA,classB preset=presetD    
    int main() { return 0; }
    ~~~   
    `;
    const post = createPost(content);

    filter._transform(post);

    t.is(highlighter.highlight.store.length, 1);
    t.is(post.content, '    <hexoPostRenderCodeBlock></hexoPostRenderCodeBlock>   \n    ');
});
