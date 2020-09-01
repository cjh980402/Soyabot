const cp = require('child_process');
const iconv = require('iconv-lite');

module.exports = function (message) {
    let rslt = "";
    try {
        if (message.content.indexOf("[") == 0) { // 노드 코드 실행
            rslt = String(eval(message.content.substr(1)));
        }
        else if (message.content.indexOf("]") == 0) { // 콘솔 명령 실행
            rslt = cmd(message.content.substr(1));
        }
        else if (message.content.indexOf("@") == 0) { // 원격 채팅 전송
            rslt = replyRoomID(message);
        }
    }
    catch (e) {
        rslt = `채팅 내용 : ${message.content}\n에러 내용 : ${e}\n${e.stack}`;
    }
    finally {
        for (let i = 0; i < rslt.length; i += 1950) { // 디스코드는 최대 2천자 제한이 있기때문에 끊어서 보내는 로직이다.
            const last = (i + 1950) > rslt.length ? rslt.length : i + 1950;
            message.channel.send(rslt.substring(i, last));
        }
    }
}

function cmd(_cmd) { // cp949를 쓰는 윈도우 콘솔에 대응
    let cmdResult;
    try {
        cmdResult = cp.execSync(_cmd, { encoding: 'binary' });
    }
    catch (e) {
        cmdResult = Buffer.from(e.toString(), 'binary');
    }
    return iconv.decode(cmdResult, 'cp949').replace(/\u001b\[\d\dm/g, ""); // cp949로 바이너리를 디코딩 -> utf-8로 변환해줌
}

function replyRoomID(message) {
    const roomID = message.content.substr(1).split(' ')[0];
    const msg = message.content.substr(1).replace(`${roomID} `, '');
    message.client.channels.cache.array().filter(v => v.id == roomID)[0].send(msg);
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