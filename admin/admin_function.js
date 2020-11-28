const Discord = require("discord.js"); // 디버깅용
const { ADMIN_ID } = require("../soyabot_config.json");
const { botNotice, replyRoomID } = require('./bot_control.js');
const { exec } = require("../util/async_to_promis");

module.exports = async function (message) {
    if (message.content.startsWith("[")) { // 노드 코드 실행 후 출력
        const funcBody = message.content.substr(1).trim().split('\n');
        funcBody.push(`message.channel.send(String(${funcBody.pop()}) || "empty string", { split: true });`); // 함수의 마지막 줄 내용은 자동으로 출력
        await eval(`(async()=>{${funcBody.join('\n')}})();`);
    }
    else if (message.content.startsWith("]")) { // 콘솔 명령 실행 후 출력
        message.channel.send(await cmd(message.content.substr(1).trim()) || "empty string", { split: true });
    }
    else if (message.content.startsWith("*")) { // 원격 채팅 전송
        const room = message.content.split('*')[1];
        if (room && message.content.startsWith(`*${room}* `)) {
            const rslt = replyRoomID(room, message.content.replace(`*${room}* `, ''));
            message.channel.send(rslt ? '채팅이 전송되었습니다.' : '존재하지 않는 방입니다.');
        }
    }
    else if (message.channel.recipient == ADMIN_ID && message.reference) { // 건의 답변 기능
        const suggestRefer = message.channel.messages.cache.get(message.reference.messageID);
        if (!suggestRefer) {
            return message.channel.send('해당하는 건의의 정보가 존재하지 않습니다.');
        }
        const target = client.suggestionChat[suggestRefer.content.split('\n')[0]];
        if (target) {
            target.reply(message.content);
            message.channel.send('건의 답변을 보냈습니다.');
        }
        else {
            message.channel.send('해당하는 건의의 정보가 존재하지 않습니다.');
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

Object.defineProperty(String.prototype, "htmlDecode", {
    value: function () {
        return this.replace(/<br>/g, "\n")
            .replace(/&#x[\da-fA-F]+;/g, (str) => String.fromCharCode(parseInt(str.substr(3), 16)))
            .replace(/&#[\d]+;/g, (str) => String.fromCharCode(parseInt(str.substr(2))))
            .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&apos;/g, "`")
            .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    }
});

Object.defineProperty(Date.prototype, "toKorean", {
    value: function () {
        const week = ['일', '월', '화', '수', '목', '금', '토'];
        return `${this.getFullYear()}. ${this.getMonth() + 1}. ${this.getDate()}.(${week[this.getDay()]}) ${this.getHours()}시 ${this.getMinutes()}분 ${this.getSeconds()}초`;
    }
});

Object.defineProperty(Object.prototype, "prop", {
    get: function () {
        return Object.getOwnPropertyNames(this).map(v => {
            try {
                return `${v}: ${this[v]}`;
            }
            catch (e) {
                return `${v}: error`;
            }
        }).join("\n");
    }
});

Object.defineProperty(Object.prototype, "pprop", {
    get: function () {
        return Object.getOwnPropertyNames(this.__proto__).map(v => {
            try {
                return `${v}: ${this[v]}`;
            }
            catch (e) {
                return `${v}: error`;
            }
        }).join("\n");
    }
});