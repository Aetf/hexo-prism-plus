'use strict'

const pathFn = require('path');
const fs = require('fs');
const { SELF } = require('./consts');

class PrismPlusGenerator {
    constructor(hexo, opts) {
        this.hexo = hexo;
        this.opts = opts;
    }

    _generate = locals => {
        if (!this.opts.enable) {
            return [];
        }
        return [
            {
                path: '/assets/prism-plus.js',
                data: () => fs.createReadStream(pathFn.join(SELF, 'client', 'prism-plus.js'))
            },
        ]
    }

    register() {
        const { hexo } = this;
        hexo.extend.generator.register('prism-plus', this._generate);
    }
}

module.exports.PrismPlusGenerator = PrismPlusGenerator;
