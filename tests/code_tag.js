'use strict';

const test = require('ava');
const { fake, setupSandbox } = require('./helpers');

const fs = require('fs/promises');
const pathFn = require('path');

const { IncludeCodeTag } = require('../src/code_tag');
const { getOptions } = require('../src/option');

setupSandbox(test, {
    code_dir: 'test_code',
});

test.serial.beforeEach(async t => {
    const { hexo } = t.context;

    t.context.test_file_content = 'int main() {\n    return 0;\n}\n';

    await fs.mkdir(pathFn.join(hexo.base_dir, 'source', 'test_code'), { recursive: true });
    await fs.writeFile(pathFn.join(hexo.base_dir, 'source', 'test_code', 'main.cpp'), t.context.test_file_content);

    t.context.highlighter = {
        highlight: fake(code => ({ rendered: code, allDeps: []}))
    };

    t.context.tag = new IncludeCodeTag(t.context.hexo, getOptions({}), t.context.highlighter);
});

test('include code tag can find file', async t => {
    const { tag, test_file_content } = t.context;
    const post = {
        _prism_plus_deps: [],
    }
    const rendered = await tag._tag(post, ['main.cpp', 'cpp', 'lineno=yes']);

    t.deepEqual(rendered, test_file_content);
});
