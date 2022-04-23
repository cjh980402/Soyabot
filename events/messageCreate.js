import { Collection } from 'discord.js';
import { setTimeout } from 'node:timers/promises';
import { adminChat } from '../admin/admin_function.js';
import { sendAdmin } from '../admin/bot_message.js';
import { MapleError } from '../classes/MapleParser.js';
import { commandCount } from '../util/soyabot_util.js';
import { PREFIX, ADMIN_ID } from '../soyabot_config.js';
const promiseTimeout = (promise, ms) => Promise.race([promise, setTimeout(ms)]);

export const name = 'messageCreate';
export async function listener(message) {
    let commandName, originCommandName;
    try {
        console.log(
            `(${new Date().toLocaleString()}) ${message.channelId} ${message.channel.name ?? 'DM'} ${
                message.author.id
            } ${message.author.username}: ${message}\n`
        );
        if (message.author.bot || message.author.system) {
            // 봇 또는 시스템 유저 여부 체크
            return;
        }

        const botPermissions = [
            'VIEW_CHANNEL',
            message.channel.isThread() ? 'SEND_MESSAGES_IN_THREADS' : 'SEND_MESSAGES',
            'READ_MESSAGE_HISTORY',
            'EMBED_LINKS',
            'ATTACH_FILES'
        ];
        const missingPermission =
            message.guildId &&
            (!message.channel.permissionsFor(message.guild.me).has(botPermissions) ||
                message.guild.me.isCommunicationDisabled());

        const [prefixCommand, ...args] = message.content.trim().split(/\s+/); // 공백류 문자로 메시지 텍스트 분할
        if (!prefixCommand.startsWith(PREFIX)) {
            // PREFIX로 시작하지 않는 경우
            if (!missingPermission) {
                if (message.author.id === ADMIN_ID) {
                    // 관리자 여부 체크
                    await adminChat(message);
                }
            }
            return;
        }
        commandName = prefixCommand.slice(PREFIX.length).toLowerCase(); // commandName은 PREFIX를 제외한 명령어 부분

        const nowCommand = message.client.commands.find((cmd) => cmd.command.includes(commandName)); // 해당하는 명령어 찾기

        if (!nowCommand?.messageExecute) {
            // 해당하는 명령어 없으면 종료
            return;
        }
        if (missingPermission) {
            // 기본 권한이 없어서 명령을 수행하지 못하는 채널이므로 DM으로 메시지 전송
            return await message.author.send(
                `봇에 적절한 권한이 부여되지 않았거나 타임아웃이 적용되어 명령을 수행할 수 없습니다.
필요한 권한 종류: ${botPermissions.join(', ')}`
            );
        }

        originCommandName = nowCommand.command[0];
        commandName = nowCommand.channelCool ? `${originCommandName}_${message.channelId}` : originCommandName;

        if (message.client.cooldowns.has(commandName)) {
            // 명령이 수행 중인 경우
            return await message.channel.send(`'${originCommandName}' 명령을 사용하기 위해 잠시 기다려야합니다.`);
        }
        message.client.cooldowns.add(commandName); // 수행 중이지 않은 명령이면 새로 추가한다
        commandCount(message.client.db, originCommandName);
        await (nowCommand.channelCool
            ? nowCommand.messageExecute(message, args)
            : promiseTimeout(nowCommand.messageExecute(message, args), 300000)); // 명령어 수행 부분
        message.client.cooldowns.delete(commandName); // 명령어 수행 끝나면 쿨타임 삭제
    } catch (err) {
        message.client.cooldowns.delete(commandName); // 에러 발생 시 쿨타임 삭제
        try {
            if (err instanceof Collection) {
                // awaitMessages에서 시간초과한 경우
                await message.channel.send(`'${originCommandName}'의 입력 대기 시간이 초과되었습니다.`);
            } else if (err instanceof MapleError) {
                await message.reply(err.message);
            } else {
                sendAdmin(
                    message.client.users,
                    `작성자: ${message.author.username}\n방 ID: ${message.channelId}\n채팅 내용: ${message}\n에러 내용: ${err.stack}`
                );
                await message.reply('에러로그가 전송되었습니다.');
            }
        } catch {}
    }
}
