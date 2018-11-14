'use strict';

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

const Hexo = require("hexo");

chai.use(chaiAsPromised);

module.exports.should = chai.should();

module.exports.hexo = new Hexo(__dirname, { slient: true });
