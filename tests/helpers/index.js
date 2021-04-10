async function getHexo(level) {
    const Hexo = require('hexo');
    const hexo = new Hexo();
    hexo.log.level = level || 40 // WARN;
    await hexo.init();
    return hexo;
}

module.exports.getHexo = getHexo;
