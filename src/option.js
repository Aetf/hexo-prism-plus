'use strict';

const { DEFAULT_OPTIONS } = require('./consts');
const _ = require('lodash');

function getOptions (hexo) {
    var config = hexo.config;

    var opts = _.defaults({}, config.prism_plus, DEFAULT_OPTIONS);

    return opts;
}

module.exports.getOptions = getOptions;
