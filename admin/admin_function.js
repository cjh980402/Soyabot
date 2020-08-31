const cp = require('child_process');
const iconv = require('iconv-lite');

module.exports = function (_cmd) { // cp949를 쓰는 윈도우 콘솔에 대응
    let cmdResult;
    try {
        cmdResult = cp.execSync(_cmd, { encoding: 'binary' });
    }
    catch (e) {
        cmdResult = Buffer.from(e.toString(), 'binary');
    }
    return iconv.decode(cmdResult, 'cp949').replace(/\u001b\[\d\dm/g, ""); // cp949로 바이너리를 디코딩 -> utf-8로 변환해줌
}

Object.defineProperty(Object.prototype, "prop", {
    get: function () {
        const self = this;
        return Object.getOwnPropertyNames(this).map(v => {
            try {
                return v + " : " + self[v]
            }
            catch (e) {
                return v + " : error";
            }
        }).join("\n");
    }
});

Object.defineProperty(Object.prototype, "prop2", {
    get: function () {
        const self = this;
        return Object.getOwnPropertyNames(this.__proto__).map(v => {
            try {
                return v + " : " + self[v];
            }
            catch (e) {
                return v + " : error";
            }
        }).join("\n");
    }
});