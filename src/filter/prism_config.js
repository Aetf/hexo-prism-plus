'use strict';

const { LINENO_CLASS } = require('../consts');
const _ = require('lodash');

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
        if (key === 'classes') {
            this._set(key, preset[key].join(','));
        } else if (key === 'styles') {
            this._set(key, preset[key].join(';'));
        } else {
            this._set(key, value);
        }
    }
};

/**
 * Update the config with inline options string
 */
PrismConfig.prototype.update = function (inline) {
    var pairs = inline.split(' ');
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