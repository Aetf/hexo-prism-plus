'use strict';
const test = require('ava');

const _ = require('lodash');

const { PrismArgs } = require('../src/highlighter');

const EMPTY_OPTIONS = {
    enable: true,
    vendor_base_url: 'https://cdnjs.cloudflare.com/ajax/libs/prism',
    plugins: [
    ],
    theme: 'prism',
    default_lang: 'clike',
    presets: {
        default: {
        }
    }
};

test('lang is provided by opts.default_lang if not present in args', t => {
    const opts = _.defaults({}, EMPTY_OPTIONS);
    const args = new PrismArgs(opts, []);
    t.is(args.lang, opts.default_lang);
});

test('lang is set to none if not present in args and no opts.default_lang is set', t => {
    const opts = _.defaults({}, EMPTY_OPTIONS);
    delete opts.default_lang;

    const args = new PrismArgs(opts, []);
    t.is(args.lang, 'none');
});

test('first term in args is treated as lang if not contains =', t => {
    const opts = _.defaults({}, EMPTY_OPTIONS);

    const args = new PrismArgs(opts, ['test-lang']);
    t.is(args.lang, 'test-lang');
});

test('first word in args is treated as keyvalue pair if contains =', t => {
    const opts = _.defaults({}, EMPTY_OPTIONS);

    const args = new PrismArgs(opts, ['test=lang']);
    t.is(args.lang, opts.default_lang);
    t.is(args.dataAttr, 'data-test="lang"');
});

test('preset can be loaded anywhere in args', t => {
    const opts = _.defaults({
        presets: {
            testPreset: {
                propertyA: true
            },
            testPresetB: {
                propertyA: false
            }
        }
    }, EMPTY_OPTIONS);

    const args = new PrismArgs(opts, ['preset=testPreset', 'lineno=true', 'preset=testPresetB']);
    t.is(args.lang, opts.default_lang);
    t.is(args.preClass, 'line-numbers');
    t.is(args.dataAttr, 'data-propertyA="false"');
});

test('lineno in preset accepts boolean', t => {
    const opts = _.defaults({
        presets: {
            default: {
                lineno: false,
            },
        }
    }, EMPTY_OPTIONS);

    let args = new PrismArgs(opts, []);
    t.is(args.preClass, '');

    opts.presets.default.lineno = true;
    args = new PrismArgs(opts, []);
    t.is(args.preClass, 'line-numbers');
})

test('classes in preset accepts array', t => {
    const opts = _.defaults({
        presets: {
            default: {
                classes: ['classA', 'classB']
            },
        }
    }, EMPTY_OPTIONS);

    const args = new PrismArgs(opts, []);
    t.is(args.preClass, 'classA classB');
});

test('styles in preset accepts object', t => {
    const opts = _.defaults({
        presets: {
            default: {
                styles: {
                    'max-height': '30em',
                }
            },
        }
    }, EMPTY_OPTIONS);

    const args = new PrismArgs(opts, []);
    t.is(args.preStyle, 'max-height: 30em');
});

test('classes in inline args accepts "," separated string', t => {
    const opts = _.defaults({}, EMPTY_OPTIONS);

    const args = new PrismArgs(opts, ['classes=classA,classB']);
    t.is(args.preClass, 'classA classB');
});

test('styles in inline args accepts ";" separated string', t => {
    const opts = _.defaults({}, EMPTY_OPTIONS);

    const args = new PrismArgs(opts, ['styles=display:none;max-height:30em;']);
    t.is(args.preStyle, 'display:none;max-height:30em;');
});

test('lineno in inline args accepts string true/false', t => {
    const opts = _.defaults({}, EMPTY_OPTIONS);

    let args = new PrismArgs(opts, ['lineno=false']);
    t.is(args.preClass, '');

    args = new PrismArgs(opts, ['lineno=true']);
    t.is(args.preClass, 'line-numbers');
})
