'use strict';

const { should, hexo } = require('./support/setup');

const _ = require('lodash');

const { DEFAULT_OPTIONS } = require('../src/consts');
const { PrismConfig, prepareLocals } = require('../src/prism_config');

describe('PrismConfig', function () {
    const code = 'abcdef<defg';
    const code_html = _.escape(code);

    it('code is HTML escaped', function () {
        var opts = _.assign({}, DEFAULT_OPTIONS);
        var locals = prepareLocals(opts, '', code);
        locals.should.have.property('code').that.equals(code_html);
    });

    it('lang is provided by opts.default_lang if not present in args', function () {
        var opts = _.assign({}, DEFAULT_OPTIONS);
        var locals = prepareLocals(opts, '', code);
        locals.should.have.property('lang').that.equals(opts.default_lang);
    });

    it('lang is set to none if not present in args and no opts.default_lang is set', function () {
        var opts = _.assign({}, DEFAULT_OPTIONS);
        delete opts.default_lang;
        var locals = prepareLocals(opts, '', code);
        locals.should.have.property('lang').that.equals('none');
    });

    it('first word in args is treated as lang if not contains =', function () {
        var opts = _.assign({}, DEFAULT_OPTIONS);
        var locals = prepareLocals(opts, 'test-lang', code);
        locals.should.have.property('lang').that.equals('test-lang');
    });

    it('first word in args is treated as keyvalue pair if contains =', function () {
        var opts = _.assign({}, DEFAULT_OPTIONS);
        var locals = prepareLocals(opts, 'test=lang', code);
        locals.should.have.property('lang').that.equals(opts.default_lang);
        locals.should.have.property('data_attr').that.equals('data-test="lang"');
    });
});