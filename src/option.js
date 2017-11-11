'use strict';

const { DEFAULT_OPTIONS, DEFAULT_VENDORS } = require('./consts');
const _ = require('lodash');

function canonicalVendors(vendors) {

    for (const key in vendors) {
        vendors[key] = _.castArray(vendors[key]);
    }
}

function getOptions (hexo) {
    var config = hexo.config;

    var opts = _.defaults({}, config.prism_plus, DEFAULT_OPTIONS);

    // canonical vendors
    opts.vendors = _.defaults(opts.vendors, DEFAULT_VENDORS);

    var base_url = opts.vendors.base_url || '';
    // make sure base_url ends with '/'
    if (!_.endsWith(base_url, '/')) {
        base_url += '/';
    }

    for (const key in opts.vendors) {
        if (key === 'base_url') continue;

        opts.vendors[key] = _.castArray(opts.vendors[key]).map(function (el) {
            return base_url + _.trimStart(el, '/');
        });
    }

    return opts;
}

module.exports.getOptions = getOptions;