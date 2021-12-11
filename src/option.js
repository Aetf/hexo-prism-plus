'use strict';

const { DEFAULT_OPTIONS } = require('./consts');
const _ = require('lodash');

function getOptions(from) {
    const opts = _.mergeWith(
        {},
        DEFAULT_OPTIONS,
        from || {},
        // concat array instead of recursive merge
        (objVal, srcVal) => {
            if (_.isArray(objVal)) {
                return objVal.concat(srcVal);
            }
        }
    );

    return opts;
}

module.exports.getOptions = getOptions;
