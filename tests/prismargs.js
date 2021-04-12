'use strict';
const test = require('ava');

const { PrismArgs } = require('../src/prism_utils');
const { getOptions } = require('../src/option');

test('lang is provided by opts.default_lang if not present in args', t => {
    const opts = getOptions({});
    const args = new PrismArgs(opts, []);
    t.is(args.lang, opts.default_lang);
});

test('lang is set to none if not present in args and no opts.default_lang is set', t => {
    const opts = getOptions({});
    delete opts.default_lang;

    const args = new PrismArgs(opts, []);
    t.is(args.lang, 'none');
});

test('first term in args is treated as lang if not contains =', t => {
    const opts = getOptions({});

    const args = new PrismArgs(opts, ['test-lang']);
    t.is(args.lang, 'test-lang');
});

test('first word in args is treated as keyvalue pair if contains =', t => {
    const opts = getOptions({});

    const args = new PrismArgs(opts, ['test=lang']);
    t.is(args.lang, opts.default_lang);
    t.is(args.preDataAttr, 'data-test="lang"');
});

test('preset can be loaded anywhere in args', t => {
    const opts = getOptions({
        presets: {
            testPreset: {
                propertyA: true
            },
            testPresetB: {
                propertyA: false
            }
        }
    });

    const args = new PrismArgs(opts, ['preset=testPreset', 'lineno=true', 'preset=testPresetB']);
    t.is(args.lang, opts.default_lang);
    t.is(args.preClass, 'line-numbers');
    t.is(args.preDataAttr, 'data-propertyA="false"');
});

test('lineno in preset accepts boolean', t => {
    const opts = getOptions({
        presets: {
            default: {
                lineno: false,
            },
        }
    });

    let args = new PrismArgs(opts, []);
    t.is(args.preClass, '');

    opts.presets.default.lineno = true;
    args = new PrismArgs(opts, []);
    t.is(args.preClass, 'line-numbers');
});

test('classes in preset accepts array', t => {
    const opts = getOptions({
        presets: {
            default: {
                classes: ['classA', 'classB']
            },
        }
    });

    const args = new PrismArgs(opts, []);
    t.is(args.preClass, 'classA classB');
});

test('styles in preset accepts object', t => {
    const opts = getOptions({
        presets: {
            default: {
                styles: {
                    'max-height': '30em',
                }
            },
        }
    });

    const args = new PrismArgs(opts, []);
    t.is(args.preStyle, 'max-height: 30em');
});

test('dependencies in preset accepts array', t => {
    const opts = getOptions({
        presets: {
            default: {
                dependencies: ['depA', 'depB']
            },
        }
    });

    const args = new PrismArgs(opts, []);
    t.deepEqual(args.dependencies, new Set(['depA', 'depB']));
})

test('classes in inline args accepts "," separated string', t => {
    const opts = getOptions({});

    const args = new PrismArgs(opts, ['classes=classA,classB']);
    t.is(args.preClass, 'classA classB');
});

test('styles in inline args accepts ";" separated string', t => {
    const opts = getOptions({});

    const args = new PrismArgs(opts, ['styles=display:none;max-height:30em;']);
    t.is(args.preStyle, 'display:none;max-height:30em;');
});

test('dependencies in inline args accepts "," separated string', t => {
    const opts = getOptions({});

    const args = new PrismArgs(opts, ['dependencies=depA,depB']);
    t.deepEqual(args.dependencies, new Set(['depA', 'depB']));
});


test('lineno in inline args accepts string true/false', t => {
    const opts = getOptions({});

    let args = new PrismArgs(opts, ['lineno=false']);
    t.is(args.preClass, '');

    args = new PrismArgs(opts, ['lineno=true']);
    t.is(args.preClass, 'line-numbers');
});

test('the default preset is always present', t => {
    const opts = getOptions({});
    t.like(opts.presets, { default: {} });
});
