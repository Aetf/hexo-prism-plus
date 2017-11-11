'use strict';

const util = require('hexo-util');
const _ = require('lodash');
const { LINENO_CLASS } = require('./consts');

function PrismConfig(opts) {
    this.presets = opts.presets;
    this.classes = new Set();
    this.data = {};
    this.styles = [];

    this._loadPreset(opts.default_preset);
}

PrismConfig.prototype._set = function (key, value) {
    value = _.toString(value);

    if (key === 'lineno') {
        if (value) {
            this.classes.add(LINENO_CLASS);
        } else {
            this.classes.delete(LINENO_CLASS);
        }
    } else if (key === 'max-height') {
        this.styles.apend(key + ': ' + value + ';');
    } else if (key === 'classes') {
        value.split(',').forEach(function(clz) {
            this.classes.add(clz)
        }, this);
    } else if (key === 'styles') {
        value.split(';').forEach(function (sty) {
            this.styles.push(sty);
        }, this);
    } else {
        this.data[key] = value;
    }
};

/**
 * Load preset from dictionary. Any previous value is cleared
 */
PrismConfig.prototype._loadPreset = function (preset) {
    this.classes = new Set();
    this.data = {};
    this.styles = [];

    for (var key in preset) {
        if (!preset[key]) continue;

        if (key === 'classes') {
            if (preset[key].length == 0) continue;
            this._set(key, preset[key].join(','));
        } else if (key === 'styles') {
            if (preset[key].length == 0) continue;
            this._set(key, preset[key].join(';'));
        } else {
            this._set(key, preset[key]);
        }
    }
};

/**
 * Update the config with inline options, as an array of pairs string
 */
PrismConfig.prototype.update = function (pairs) {
    // Find preset and load first
    pairs.forEach(function (pair) {
        var [key, value] = pair.split('=');
        if (key === 'preset' && value in this.presets) {
            this._loadPreset(this.presets[value]);
        }
    });

    pairs.forEach(function (pair) {
        var [key, value] = pair.split('=');
        if (!value || key === 'preset') return;

        this._set(key, value);
    }, this);
};

PrismConfig.prototype.pre_class = function () {
    return _.toArray(this.classes).join(' ');
}

PrismConfig.prototype.pre_style = function () {
    return this.styles.join('; ');
}

PrismConfig.prototype.data_attr = function () {
    var attrs = []
    for (var k in this.data) {
        attrs.push('data-' + k + '="' + this.data[k] + '"');
    }
    return attrs.join(' ');
}

module.exports.PrismConfig = PrismConfig;

module.exports.prepareLocals = function (opts, args, code) {
    var lang = opts.default_lang || 'none';

    args = _.trim(args).split(' ');
    if (args.length > 0 && args[0].indexOf('=') == -1) {
        // treat it as lang if it is not empty
        lang = args.shift() || lang;
    }

    console.log('lang is ' + lang);

    var locals = {
        lang: lang,
        code: util.escapeHTML(code)
    };

    console.log('args are ' + args);
    var pconfig = new PrismConfig(opts);
    pconfig.update(args);

    locals.pre_class = pconfig.pre_class();
    locals.pre_style = pconfig.pre_style();
    locals.data_attr = pconfig.data_attr();

    return locals;
}