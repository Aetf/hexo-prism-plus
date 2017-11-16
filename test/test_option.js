'use strict';

const { should, hexo } = require('./support/setup');

const { getOptions } = require('../src/option');

describe('Option', function () {
    hexo.config.prism_plus = {
        vendors: {
            prism: 'abc',
            prism_css: 'def'
        }
    };

    it('vendors accepts single string and converts to array', function () {
        var result = getOptions(hexo);
        result.should.have.property('vendors').that.is.an('object');
        result.vendors.should.have.property('prism').that.is.an('array');
        result.vendors.should.have.property('prism_css').that.is.an('array');
    });

    it('base_url is prepended to vendors keys', function () {
        hexo.config.prism_plus.vendors.base_url = "base_url/";
        var result = getOptions(hexo);
        result.vendors.prism.should.match(/^base_url/);
        result.vendors.prism_css.should.match(/^base_url/);
    });
});