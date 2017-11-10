'use strict';

const { DEFAULT_OPTIONS } = require('./consts');
const _ = require('lodash');

function canonicalVendors(vendors) {
    for (const key in vendors) {
        vendors[key] = _.castArray(vendors[key]);
    }
}

function getOptions (hexo) {
    var config = hexo.config;

    var opts = _.defaults({}, config.prism_plus, DEFAULT_OPTIONS);

    canonicalVendors(opts.vendors);

    return opts
}

module.exports.getOptions = getOptions;