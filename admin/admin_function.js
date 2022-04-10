import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';
import { replyChannelID } from './bot_control.js';
import { MapleProb } from '../util/maple_probtable.js';
import { fetchFullContent, sendSplitCode } from '../util/soyabot_util.js';

export const exec = promisify(_exec);

export async function adminChat(message) {
    const fullContent = await fetchFullContent(message);
    const targetId = /^\^(\d+)\^\s/.exec(fullContent)?.[1];
    if (fullContent.startsWith('>')) {
        // 노드 코드 실행 후 출력
        const funcBody = fullContent.slice(1).trim().split('\n'); // 긴 코드 테스트를 위해 fullContent 이용
        funcBody.push(`return ${funcBody.pop()};`); // 함수의 마지막 줄 내용은 자동으로 반환
        return sendSplitCode(message.channel, String(await eval(`(async () => {\n${funcBody.join('\n')}\n})()`)), {
            code: 'js',
            split: { char: '' }
        });
        // eval의 내부가 async 함수의 리턴값이므로 await까지 해준다.
    } else if (fullContent.startsWith(')')) {
        // 콘솔 명령 실행 후 출력
        return sendSplitCode(message.channel, (await exec(fullContent.slice(1).trim())).stdout, {
            code: 'ansi',
            split: { char: '' }
        });
    } else if (targetId) {
        // 원하는 방에 봇으로 채팅 전송 (텍스트 채널 ID 이용)
        const rslt = await replyChannelID(message.client.channels, targetId, fullContent.slice(targetId.length + 3));
        return message.channel.send(rslt ? '채팅이 전송되었습니다.' : '존재하지 않는 방입니다.');
    } else if (message.channel.type === 'DM' && message.reference) {
        // 건의 답변 기능
        const suggestRefer = await message.fetchReference();
        const [channelId] = suggestRefer.content.split(/\s/);
        const rslt = await replyChannelID(message.client.channels, channelId, `[건의 답변]\n${fullContent}`);
        return message.channel.send(rslt ? '건의 답변을 보냈습니다.' : '해당하는 건의의 정보가 존재하지 않습니다.');
    }
}

export async function initClient(client, TOKEN) {
    client.db.run(
        'CREATE TABLE IF NOT EXISTS maple_notice(id integer primary key autoincrement, title text, url text, notice_number integer)'
    );
    client.db.run('CREATE INDEX IF NOT EXISTS notice_index ON maple_notice(title, notice_number)');
    client.db.run(
        'CREATE TABLE IF NOT EXISTS maple_update(id integer primary key autoincrement, title text, url text, notice_number integer)'
    );
    client.db.run('CREATE INDEX IF NOT EXISTS update_index ON maple_update(title, notice_number)');
    client.db.run(
        'CREATE TABLE IF NOT EXISTS maple_test(id integer primary key autoincrement, title text, url text, notice_number integer)'
    );
    client.db.run('CREATE INDEX IF NOT EXISTS test_index ON maple_test(title, notice_number)');
    client.db.run(
        'CREATE TABLE IF NOT EXISTS test_patch(id integer primary key autoincrement, version integer, url text)'
    );
    client.db.run(
        'CREATE TABLE IF NOT EXISTS pruning_skip(id integer primary key autoincrement, guild_id text, name text)'
    );
    client.db.run(
        'CREATE TABLE IF NOT EXISTS command_db(id integer primary key autoincrement, name text, count integer)'
    );

    await MapleProb.fetchAllProb();
    await client.login(TOKEN);
    await client.application.fetch();
}
