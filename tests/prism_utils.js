'use strict';
const test = require('ava');

const { PrismUtils } = require('../src/prism_utils');

test('allDependencies sorts properly if a lang is both directly and indirectly depended on', t => {
    const utils = new PrismUtils();
    utils._langDependencies = {};

    const results = utils.allDependencies('bash', ['clike', 'javascript']);

    t.deepEqual(results, ['clike', 'markup', 'bash', 'javascript']);
});

test('allDependencies ignores force load', t => {
    const utils = new PrismUtils();
    utils._langDependencies = {};

    const results = utils.allDependencies('!javascript');

    t.deepEqual(results, ['clike', 'markup', 'javascript']);
});

test('allDependencies resolves alias', t => {
    const utils = new PrismUtils();
    utils._langDependencies = {};

    const results = utils.allDependencies('js');

    t.deepEqual(results, ['clike', 'markup', 'javascript']);
});

test('allDependencies skips none', t => {
    const utils = new PrismUtils();
    utils._langDependencies = {};

    const results = utils.allDependencies('none');

    t.deepEqual(results, []);
});
