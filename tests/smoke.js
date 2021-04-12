'use strict';

const test = require('ava');
const { setupSandbox } = require('./helpers');

const pathFn = require('path');
const fs = require('fs/promises');

setupSandbox(test, {
    highlight: { enable: false },
    prism: { enable: false },
    code_dir: 'test_code',
    prism_plus: { enable: true, plugins: ['line-numbers'] },
});


test.serial.beforeEach('Load hexo plugins', async t => {
    const { hexo } = t.context;
    await hexo.loadPlugin(require.resolve('../src'));
});

test('render code block in post', async t => {
    const { hexo } = t.context;

    const post = {
        full_source: pathFn.join(hexo.source_dir, '_posts', 'test.txt'),
        content: `
        ~~~ clike lineno=true styles=max-height:30em
        int main() {
            return 0;
        }
        ~~~
        `,
    };

    const renderedPost = await hexo.post.render(post.full_source, post);

    t.snapshot(renderedPost.content);
});

test('render code tag in post', async t => {
    const { hexo } = t.context;

    const test_file_content = 'int main() {\n    return 0;\n}\n';

    await fs.mkdir(pathFn.join(hexo.source_dir, 'test_code'), { recursive: true });
    await fs.writeFile(pathFn.join(hexo.source_dir, 'test_code', 'test.cpp'), test_file_content);

    const post = {
        full_source: pathFn.join(hexo.source_dir, '_posts', 'test.txt'),
        content: `
        {% includecode test.cpp clike lineno=true styles=max-height:30em %}
        `,
    };

    const renderedPost = await hexo.post.render(post.full_source, post);

    t.snapshot(renderedPost.content);
});
