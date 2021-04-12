'use strict'

// Taken from: https://github.com/bryc/code/blob/master/jshash/PRNGs.md#addendum-a-seed-generating-functions

// generate seeds from a string
function xmur3(str) {
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
        h = h << 13 | h >>> 19;
    return function() {
        h = Math.imul(h ^ h >>> 16, 2246822507),
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}

// small fast counter with 4 seeds
function sfc32(a, b, c, d) {
    return function() {
      a |= 0; b |= 0; c |= 0; d |= 0; 
      var t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = c << 21 | c >>> 11;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}

function randGen(seed) {
    // Create xmur3 state
    const seeder = xmur3(seed || 'hexo-prism-plus');
    // Output four 32-bit hashes to provide the seed for sfc32.
    const rand = sfc32(seeder(), seeder(), seeder(), seeder());

    // Obtain sequential random numbers like so:
    // rand();
    // rand();
    return rand;
}

module.exports.idGen = (seed) => {
    const rand = randGen(seed);
    return () => Buffer.from(Float32Array.of(rand()).buffer).toString('hex');
}
