const cp = require('child_process');

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
            const roomID = message.content.substr(1).split(' ')[0];
            const msg = message.content.substr(1).replace(`${roomID} `, '');
            message.client.channels.cache.array().filter(v => v.id == roomID)[0].send(msg);
            rslt = "채팅 전송 완료";
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

function cmd(_cmd) {
    let cmdResult;
    try {
        cmdResult = cp.execSync(_cmd).toString();
    }
    catch (e) {
        cmdResult = e.toString();
    }
    return cmdResult.replace(/\u001b\[\d\dm/g, "");;
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