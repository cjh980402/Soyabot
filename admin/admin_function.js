const { Channel } = require("discord.js");
const cp = require('child_process');

module.exports = async function (message) {
    if (message.content.startsWith("[")) { // 노드 코드 실행
        const funcBody = message.content.substr(1).trim().split('\n'); // 긴 코드 테스트를 위해 1천자 이상 경우에도 대응 (FullText 이용)
        funcBody[funcBody.length - 1] = `message.channel.sendFullText(String(${funcBody[funcBody.length - 1]}))`; // 함수의 마지막 줄 내용은 자동으로 출력
        await eval(`(async()=>{${funcBody.join('\n')}})();`);
    }
    else if (message.content.startsWith("]")) { // 콘솔 명령 실행
        message.channel.sendFullText(cmd(message.content.substr(1)));
    }
    else if (message.content.startsWith("@")) { // 원격 채팅 전송
        const roomID = message.content.substr(1).split(' ')[0];
        const msg = message.content.substr(1).replace(`${roomID} `, '');
        message.client.channels.cache.array().find(v => v.id == roomID).send(msg);
        message.channel.sendFullText("채팅 전송 완료");
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
        return Object.getOwnPropertyNames(this).map(v => {
            try {
                return v + " : " + this[v]
            }
            catch (e) {
                return v + " : error";
            }
        }).join("\n");
    }
});

Object.defineProperty(Object.prototype, "prop2", {
    get: function () {
        return Object.getOwnPropertyNames(this.__proto__).map(v => {
            try {
                return v + " : " + this[v];
            }
            catch (e) {
                return v + " : error";
            }
        }).join("\n");
    }
});

Object.defineProperty(Channel.prototype, "sendFullText", {
    value: function (str) {
        if (typeof str != 'string')
            return;

        for (let i = 0; i < str.length; i += 1950) { // 디스코드는 최대 2천자 제한이 있기때문에 끊어서 보내는 로직이다.
            const last = (i + 1950) > str.length ? str.length : i + 1950;
            this.send(str.substring(i, last));
        }
    }
});