const Discord = require('../util/discord.js-extend'); // 디버깅용
const util = require('util');
const cp = require('child_process');
const exec = util.promisify(cp.exec);
const { ADMIN_ID } = require('../soyabot_config.json');
const { botNotice, replyRoomID } = require('./bot_control.js');
const { startNotice, stopNotice, startUpdate, stopUpdate, startTest, stopTest, startTestPatch, stopTestPatch, startFlag, stopFlag } = require('./maple_auto_notice');

module.exports.adminChat = async function (message) {
    debugFunc(message);
    const fullContent = await message.fullContent;
    if (fullContent.startsWith('>')) {
        // 노드 코드 실행 후 출력
        const funcBody = fullContent.substr(1).trim().split('\n'); // 긴 코드 테스트를 위해 fullContent 이용
        funcBody.push(`return ${funcBody.pop()};`); // 함수의 마지막 줄 내용은 자동으로 반환
        message.channel.send(String(await eval(`(async () => {\n${funcBody.join('\n')}\n})()`)) || 'empty message', { split: { char: '' } });
        // eval의 내부가 async 함수의 리턴값이므로 await까지 해준다.
    } else if (fullContent.startsWith(')')) {
        // 콘솔 명령 실행 후 출력
        message.channel.send((await module.exports.cmd(fullContent.substr(1).trim(), true)) || 'empty message', { split: { char: '' } });
    } else if (fullContent.startsWith('*')) {
        // 원하는 방에 봇으로 채팅 전송 (텍스트 채널 ID 이용)
        const room = fullContent.split('*')[1];
        if (room && fullContent.startsWith(`*${room}* `)) {
            const rslt = replyRoomID(room, fullContent.replace(`*${room}* `, ''));
            message.channel.send(rslt ? '채팅이 전송되었습니다.' : '존재하지 않는 방입니다.');
        }
    } else if (message.channel.recipient == ADMIN_ID && message.reference) {
        // 건의 답변 기능
        const suggestRefer = message.channel.messages.cache.get(message.reference.messageID);
        const target = client.suggestionChat[suggestRefer?.content.split('\n')[0]];
        target?.reply(fullContent);
        message.channel.send(target ? '건의 답변을 보냈습니다.' : '해당하는 건의의 정보가 존재하지 않습니다.');
    }
};

module.exports.cmd = async function (_cmd, returnRslt = false) {
    if (returnRslt) {
        try {
            return (await exec(_cmd)).stdout.replace(/\u001b\[\d\dm/g, '').trimEnd();
        } catch (e) {
            return String(e).trimEnd();
        }
    } else {
        return await exec(_cmd);
    }
};

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

    client.suggestionChat = {}; // 건의 기능을 사용한 Message객체 임시 저장
    client.setMaxListeners(20); // 이벤트 개수 제한 증가
    // client.guilds.cache.forEach((v) => v.members.fetch()); // 모든 멤버 목록 가져오기 (Privileged intents 허가 돼야 가능)

    startNotice(); // 공지 자동 알림 기능
    startUpdate(); // 업데이트 자동 알림 기능
    startTest(); // 테섭 자동 알림 기능
    startTestPatch(); // 테섭 패치 감지 기능
    startFlag(); // 플래그 5분 전 알림
};

function debugFunc(message) {
    // 특정 기능 디버깅할 때 내용을 바꿔서 테스트 해주면 됨
}
