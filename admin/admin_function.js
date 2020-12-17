const Discord = require("discord.js"); // 디버깅용
const { decodeHTML } = require("entities");
const { inspect } = require("util");
const { ADMIN_ID } = require("../soyabot_config.json");
const { botNotice, replyRoomID } = require('./bot_control.js');
const { startNotice, stopNotice, startUpdate, stopUpdate, startTest, stopTest, startTestPatch, stopTestPatch, startFlag, stopFlag } = require('./maple_auto_notice');
const { exec } = require("../util/async_to_promis");

module.exports.adminChat = async function (message) {
    if (message.content.startsWith("[")) { // 노드 코드 실행 후 출력
        const funcBody = message.content.substr(1).trim().split('\n');
        funcBody.push(`message.channel.send(String(${funcBody.pop()}) || "empty string", { split: true });`); // 함수의 마지막 줄 내용은 자동으로 출력
        await eval(`(async()=>{${funcBody.join('\n')}})();`); // 에러캐치를 위해 await까지 해준다.
    }
    else if (message.content.startsWith("]")) { // 콘솔 명령 실행 후 출력
        message.channel.send(await module.exports.cmd(message.content.substr(1).trim()) || "empty string", { split: true });
    }
    else if (message.content.startsWith("*")) { // 원하는 방에 봇으로 채팅 전송
        const room = message.content.split('*')[1];
        if (room && message.content.startsWith(`*${room}* `)) {
            const rslt = replyRoomID(room, message.content.replace(`*${room}* `, ''));
            message.channel.send(rslt ? '채팅이 전송되었습니다.' : '존재하지 않는 방입니다.');
        }
    }
    else if (message.channel.recipient == ADMIN_ID && message.reference) { // 건의 답변 기능
        const suggestRefer = message.channel.messages.cache.get(message.reference.messageID);
        const target = client.suggestionChat[suggestRefer?.content.split('\n')[0]];
        target?.reply(message.content);
        message.channel.send(target ? '건의 답변을 보냈습니다.' : '해당하는 건의의 정보가 존재하지 않습니다.');
    }
}

module.exports.cmd = async function (_cmd) {
    let cmdResult;
    try {
        cmdResult = (await exec(_cmd)).stdout;
    }
    catch (e) {
        cmdResult = e.toString();
    }
    return cmdResult.replace(/\u001b\[\d\dm/g, "").trimEnd();
}

module.exports.initClient = async function () {
    await db.run('CREATE TABLE IF NOT EXISTS maplenotice(title text primary key, url text not null)');
    await db.run('CREATE TABLE IF NOT EXISTS mapleupdate(title text primary key, url text not null)');
    await db.run('CREATE TABLE IF NOT EXISTS mapletest(title text primary key, url text not null)');
    await db.run('CREATE TABLE IF NOT EXISTS noticeskip(channelid text primary key, name text not null)');
    await db.run('CREATE TABLE IF NOT EXISTS updateskip(channelid text primary key, name text not null)');
    await db.run('CREATE TABLE IF NOT EXISTS flagskip(channelid text primary key, name text not null)');
    await db.run('CREATE TABLE IF NOT EXISTS testskip(channelid text primary key, name text not null)');
    await db.run('CREATE TABLE IF NOT EXISTS testpatchskip(channelid text primary key, name text not null)');
    await db.run('CREATE TABLE IF NOT EXISTS pruningskip(channelid text primary key, name text not null)');
    await db.run("CREATE TABLE IF NOT EXISTS messagedb(channelsenderid text primary key, messagecnt integer default 0, lettercnt integer default 0, lastmessage text default '', lasttime datetime default (datetime('now', 'localtime')))");

    client.suggestionChat = {};
    client.setMaxListeners(20); // 이벤트 개수 제한 증가
    client.options.retryLimit = 3; // 네트워크 재요청 횟수 설정

    startNotice(); // 공지 자동 알림 기능
    startUpdate(); // 업데이트 자동 알림 기능
    startTest(); // 테섭 자동 알림 기능
    startTestPatch(); // 테섭 패치 감지 기능
    startFlag(); // 플래그 5분 전 알림
}

Object.defineProperty(String.prototype, "decodeHTML", {
    value: function () {
        return decodeHTML(this).replace(/<br>/g, "\n");
    }
});

Object.defineProperty(Object.prototype, "$i", { // util.inspect의 결과 출력
    value: function (dep = 2) {
        return inspect(this, { depth: dep });
    }
});

Object.defineProperty(Object.prototype, "$", { // 객체의 키와 값 출력
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

Object.defineProperty(Object.prototype, "$k", { // 객체의 키만 출력
    get: function () {
        return Object.getOwnPropertyNames(this).join("\n");
    }
});

Object.defineProperty(Object.prototype, "$$", { // 상위 프로토타입의 키와 값 출력
    get: function () {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).map(v => {
            try {
                return `${v}: ${this[v]}`;
            }
            catch (e) {
                return `${v}: error`;
            }
        }).join("\n");
    }
});

Object.defineProperty(Object.prototype, "$$k", { // 상위 프로토타입의 키만 출력
    get: function () {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).join("\n");
    }
});