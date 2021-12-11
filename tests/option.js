'use strict';
const test = require('ava');

const { getOptions } = require('../src/option');

test('user-specified site-options should have higher priority than default ones', t => {
    const user = {
        enable: false,
        default_lang: 'another',
        vendor_base_url: 'https://example.com',
        plugins: ['a', 'b'],
        theme: 'prism',
        presets: {
            default: {
                abc: 2
            },
            another: {
                abc: 1
            }
        }
    };
    const opt = getOptions({
        ...user
    });

    t.like(opt, user);
})
