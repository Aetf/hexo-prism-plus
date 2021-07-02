'use strict';

const fs = require('fs/promises');
const pathFn = require('path');
const { tmpdir } = require('os');

const _ = require('lodash');


async function getHexo(base_dir, config) {
    const Hexo = require('hexo');
    const hexo = new Hexo(base_dir || __dirname);
    hexo.log.level = 40 // WARN;
    // always pretend the package.json in base_dir is loaded.
    // see hexojs/hexo/lib/hexo/update_package.js
    hexo.env.init = true;
    hexo.config = _.assign(hexo.config, config || {});
    await hexo.init();
    return hexo;
}

function setupSandbox(test, hexo_config) {
    test.serial.beforeEach('Setup hexo sandbox', async t => {
        const td = await fs.mkdtemp(pathFn.join(tmpdir(), 'hexo-prism-plus-'));
        t.context.td = td;
        t.context.hexo = await getHexo(td, hexo_config);
    });
    test.afterEach.always('Cleanup hexo sandbox', async t => {
        fs.rm(t.context.hexo.base_dir, { recursive: true });
    });
}

/**
 * A fake function
 * @param {} val 
 * @returns 
 */
function fake(val) {
    const store = [];
    const faked = function() {
        store.push({
            calledWith: this,
            calledArguments: arguments
        });

        if (_.isFunction(val)) {
            return val.apply(this, arguments);
        } else {
            return val;
        }
    }
    faked.store = store;
    return faked
}

module.exports.getHexo = getHexo;
module.exports.fake = fake;
module.exports.setupSandbox = setupSandbox;
