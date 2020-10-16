const { Channel } = require("discord.js");
const { botNotice, replyRoomID } = require('./bot_control.js');
const util = require('util');
const cp = require('child_process');
const exec = util.promisify(cp.exec);
const startDate = new Date();

module.exports = async function (message) {
    if (message.content.startsWith("[")) { // 노드 코드 실행
        const funcBody = message.content.substr(1).trim().split('\n');
        funcBody[funcBody.length - 1] = `message.channel.sendFullText(String(${funcBody[funcBody.length - 1]}))`; // 함수의 마지막 줄 내용은 자동으로 출력
        await eval(`(async()=>{${funcBody.join('\n')}})();`);
    }
    else if (message.content.startsWith("]")) { // 콘솔 명령 실행
        message.channel.sendFullText(await cmd(message.content.substr(1)));
    }
    else if (message.content.startsWith("@")) { // 원격 채팅 전송
        const room = message.content.substr(1).split(' ')[0];
        if (room && message.content.startsWith(`@${room} `)) {
            replyRoomID(room, message.content.substr(1).replace(`${room} `, ''));
            message.channel.send("채팅 전송 완료");
        }
    }
}

async function cmd(_cmd) {
    let cmdResult;
    try {
        cmdResult = (await exec(_cmd)).stdout;
    }
    catch (e) {
        cmdResult = e.toString();
    }
    return cmdResult.replace(/\u001b\[\d\dm/g, "").trimEnd();
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
        if (this.type != 'dm' && this.type != 'text')
            return;
        str = String(str);
        for (let i = 0; i < str.length; i += 1999) { // 디스코드는 최대 2천자 제한이 있기때문에 끊어서 보내는 로직이다.
            const last = (i + 1999) > str.length ? str.length : i + 1999;
            this.send(str.substring(i, last));
        }
    }
});