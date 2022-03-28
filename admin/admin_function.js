import { Message } from 'discord.js';
import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';
import { botNotice, replyChannelID } from './bot_control.js';
import {
    startNotice,
    stopNotice,
    startUpdate,
    stopUpdate,
    startTest,
    stopTest,
    startTestPatch,
    stopTestPatch,
    startUrus,
    stopUrus
} from './maple_auto_notice.js';
import { MapleProb } from '../util/maple_probtable.js';
import { ADMIN_ID } from '../soyabot_config.js';

export const exec = promisify(_exec);

export async function adminChat(message) {
    const fullContent = await message.fetchFullContent();
    const targetId = /^\^(\d+)\^\s/.exec(fullContent)?.[1];
    if (fullContent.startsWith('>')) {
        // 노드 코드 실행 후 출력
        const funcBody = fullContent.slice(1).trim().split('\n'); // 긴 코드 테스트를 위해 fullContent 이용
        funcBody.push(`return ${funcBody.pop()};`); // 함수의 마지막 줄 내용은 자동으로 반환
        return message.channel.sendSplitCode(String(await eval(`(async () => {\n${funcBody.join('\n')}\n})()`)), {
            code: 'js',
            split: { char: '' }
        });
        // eval의 내부가 async 함수의 리턴값이므로 await까지 해준다.
    } else if (fullContent.startsWith(')')) {
        // 콘솔 명령 실행 후 출력
        return message.channel.sendSplitCode((await exec(fullContent.slice(1).trim())).stdout, {
            code: 'ansi',
            split: { char: '' }
        });
    } else if (targetId) {
        // 원하는 방에 봇으로 채팅 전송 (텍스트 채널 ID 이용)
        const rslt = await replyChannelID(message.client.channels, targetId, fullContent.slice(targetId.length + 3));
        return message.channel.send(rslt ? '채팅이 전송되었습니다.' : '존재하지 않는 방입니다.');
    } else if (message.channel.recipient?.id === ADMIN_ID && message.reference) {
        // 건의 답변 기능
        try {
            const suggestRefer = await message.fetchReference();
            const [channelId, messageId] = suggestRefer.content.split(/\s/);
            await new Message(message.client, { id: messageId, channel_id: channelId }).reply(
                `[건의 답변]\n${fullContent}`
            );
            return message.channel.send('건의 답변을 보냈습니다.');
        } catch {
            return message.channel.send('해당하는 건의의 정보가 존재하지 않습니다.');
        }
    }
}

export async function initClient(client, TOKEN) {
    client.db.run('CREATE TABLE IF NOT EXISTS maplenotice(title text primary key, url text not null)');
    client.db.run('CREATE TABLE IF NOT EXISTS mapleupdate(title text primary key, url text not null)');
    client.db.run('CREATE TABLE IF NOT EXISTS mapletest(title text primary key, url text not null)');
    client.db.run('CREATE TABLE IF NOT EXISTS testpatch(version integer primary key, url text not null)');
    /*client.db.run('CREATE TABLE IF NOT EXISTS noticeskip(channelid text primary key, name text not null)');
    client.db.run('CREATE TABLE IF NOT EXISTS updateskip(channelid text primary key, name text not null)');
    client.db.run('CREATE TABLE IF NOT EXISTS urusskip(channelid text primary key, name text not null)');
    client.db.run('CREATE TABLE IF NOT EXISTS testskip(channelid text primary key, name text not null)');
    client.db.run('CREATE TABLE IF NOT EXISTS testpatchskip(channelid text primary key, name text not null)');*/
    client.db.run('CREATE TABLE IF NOT EXISTS pruningskip(channelid text primary key, name text not null)');
    client.db.run('CREATE TABLE IF NOT EXISTS commanddb(commandname text primary key, count integer default 0)');

    await MapleProb.fetchAllProb();
    await client.login(TOKEN);
    await client.application.fetch();

    client.setMaxListeners(20); // 이벤트 개수 제한 증가

    if (client.shard.ids.includes(0)) {
        // 첫번째 샤드에서만 공지 기능 활성화
        startNotice(client); // 공지 자동 알림 기능
        startUpdate(client); // 업데이트 자동 알림 기능
        startTest(client); // 테섭 자동 알림 기능
        startTestPatch(client); // 테섭 패치 감지 기능
        startUrus(client); // 우르스 2배 종료 30분 전 알림
    }
}
