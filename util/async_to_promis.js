const util = require('util');
const fs = require('fs');
const cp = require('child_process');
module.exports.exists = util.promisify(fs.exists);
module.exports.readFile = util.promisify(fs.readFile);
module.exports.writeFile = util.promisify(fs.writeFile);
module.exports.unlink = util.promisify(fs.unlink);
module.exports.exec = util.promisify(cp.exec);
// 콜백 비동기 함수를 프로미스화 하는 모듈