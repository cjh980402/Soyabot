/**
 * 모듈 import
 */
import './util/soyabot_setting_polyfill.js'; // 제일 처음에 import 해야하는 폴리필 모듈
import { Client, Collection, Options } from 'discord.js';
import { readdirSync } from 'node:fs';
import { setTimeout } from 'node:timers/promises';
import { TOKEN, PREFIX, ADMIN_ID } from './soyabot_config.js';
import { adminChat, initClient, exec } from './admin/admin_function.js';
import { replyAdmin } from './admin/bot_control.js';
import { MapleError } from './util/maple_parsing.js';
import { musicActiveControl, musicButtonControl } from './util/music_play.js';
import botChatting from './util/bot_chatting.js';
import cachingMessage from './util/message_caching.js';
import sqlite from './util/sqlite-handler.js';
globalThis.db = new sqlite('./db/soyabot_data.db'); // db와 client는 빈번하게 사용되므로 global 객체에 저장
globalThis.client = new Client(Options.createCustom());
client.commands = []; // 명령어 객체 저장할 배열
client.queues = new Map(); // 음악기능 정보 저장용
client.prefix = PREFIX; // 명령어 접두사
const cooldowns = new Set(); // 중복 명령 방지용
const promiseTimeout = (promise, ms) => Promise.race([promise, setTimeout(ms)]);

process.on('unhandledRejection', (err) => {
    // node.js v15부터 Unhandled promise rejection이 발생하면 프로세스를 비정상 종료시키므로 처리를 해야함
    console.error('Unhandled promise rejection:', err);
});

try {
    await initClient(TOKEN); // 클라이언트 초기 세팅 함수
    /**
     * 모든 명령 import
     */
    const datas = [];
    for (const file of readdirSync('./commands')) {
        if (file.endsWith('.js')) {
            const cmd = await import(`./commands/${file}`);
            client.commands.push(cmd); // js파일의 명령 객체를 배열에 push
            if (cmd.commandData) {
                datas.push(cmd.commandData);
            }
        }
    }
    // await client.application.commands.set(datas); // 인터랙션 데이터 변경 시에만 활성화하기
    replyAdmin(`${client.user.tag}이 작동 중입니다.`);
} catch (err) {
    console.error('로그인 에러 발생:', err);
    await exec('npm stop');
}
/**
 * 클라이언트 이벤트
 */
client.on('error', async (err) => {
    console.error('클라이언트 에러 발생:', err);
    await setTimeout(30000); // 30초 대기
    await exec('npm restart'); // 재시작
});

client.on('voiceStateUpdate', musicActiveControl); // 유저 음성채팅 상태 변경 이벤트

client.on('messageCreate', async (message) => {
    // 각 메시지에 반응, 디스코드는 봇의 메시지도 이 이벤트에 들어옴
    let commandName;
    try {
        console.log(
            `(${new Date().toLocaleString()}) ${message.channelId} ${message.channel.name ?? 'DM'} ${
                message.author.id
            } ${message.author.username}: ${message.content || message.embeds[0]?.description || ''}\n`
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
        if (!prefixCommand.startsWith(client.prefix)) {
            // client.prefix로 시작하지 않는 경우
            if (!missingPermission) {
                if (message.author.id === ADMIN_ID) {
                    // 관리자 여부 체크
                    await adminChat(message);
                }
                await botChatting(message); // 잡담 로직
            }
            return;
        }
        commandName = prefixCommand.slice(client.prefix.length).toLowerCase(); // commandName은 client.prefix를 제외한 명령어 부분

        const nowCommand = client.commands.find((cmd) => cmd.command.includes(commandName)); // 해당하는 명령어 찾기

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

        commandName = nowCommand.channelCool ? `${nowCommand.command[0]}_${message.channelId}` : nowCommand.command[0];

        if (cooldowns.has(commandName)) {
            // 명령이 수행 중인 경우
            return await message.channel.send(`'${nowCommand.command[0]}' 명령을 사용하기 위해 잠시 기다려야합니다.`);
        }
        cooldowns.add(commandName); // 수행 중이지 않은 명령이면 새로 추가한다
        await (nowCommand.channelCool
            ? nowCommand.messageExecute(message, args)
            : promiseTimeout(nowCommand.messageExecute(message, args), 300000)); // 명령어 수행 부분
        cooldowns.delete(commandName); // 명령어 수행 끝나면 쿨타임 삭제
    } catch (err) {
        cooldowns.delete(commandName); // 에러 발생 시 쿨타임 삭제
        try {
            if (err instanceof Collection) {
                // awaitMessages에서 시간초과한 경우
                await message.channel.send(`'${commandName.split('_')[0]}'의 입력 대기 시간이 초과되었습니다.`);
            } else if (err instanceof MapleError) {
                await message.reply(err.message);
            } else {
                replyAdmin(
                    `작성자: ${message.author.username}\n방 ID: ${message.channelId}\n채팅 내용: ${message}\n에러 내용: ${err.stack}`
                );
                await message.reply('에러로그가 전송되었습니다.');
            }
        } catch {}
    } finally {
        cachingMessage(message); // 들어오는 채팅 항상 캐싱
    }
});

client.on('interactionCreate', async (interaction) => {
    // 각 인터랙션에 반응
    if (interaction.isButton()) {
        musicButtonControl(interaction);
    } else if (interaction.isCommand()) {
        let { commandName } = interaction;
        try {
            await interaction.deferReply(); // deferReply를 하지 않으면 3초 내로 슬래시 커맨드 응답을 해야함
            console.log(
                `(${new Date().toLocaleString()}) ${interaction.channelId} ${interaction.channel.name ?? 'DM'} ${
                    interaction.user.id
                } ${interaction.user.username}: ${interaction}\n`
            );

            const botPermissions = [
                'VIEW_CHANNEL',
                interaction.channel.isThread() ? 'SEND_MESSAGES_IN_THREADS' : 'SEND_MESSAGES',
                'READ_MESSAGE_HISTORY',
                'EMBED_LINKS',
                'ATTACH_FILES'
            ];
            const missingPermission =
                interaction.guildId &&
                (!interaction.channel.permissionsFor(interaction.guild.me).has(botPermissions) ||
                    interaction.guild.me.isCommunicationDisabled());

            const nowCommand = client.commands.find((cmd) => cmd.commandData?.name === commandName); // 해당하는 명령어 찾기

            if (!nowCommand?.commandExecute) {
                // 해당하는 명령어 없으면 종료
                return;
            }
            if (missingPermission) {
                // 기본 권한이 없어서 명령을 수행하지 못하는 채널이므로 DM으로 메시지 전송
                return await interaction.user.send(
                    `봇에 적절한 권한이 부여되지 않았거나 타임아웃이 적용되어 명령을 수행할 수 없습니다.
필요한 권한 종류: ${botPermissions.join(', ')}`
                );
            }

            commandName = nowCommand.channelCool ? `${commandName}_${interaction.channelId}` : commandName;

            if (cooldowns.has(commandName)) {
                // 명령이 수행 중인 경우
                return await interaction.followUp(
                    `'${nowCommand.commandData.name}' 명령을 사용하기 위해 잠시 기다려야합니다.`
                );
            }
            cooldowns.add(commandName); // 수행 중이지 않은 명령이면 새로 추가한다
            await (nowCommand.channelCool
                ? nowCommand.commandExecute(interaction)
                : promiseTimeout(nowCommand.commandExecute(interaction), 300000)); // 명령어 수행 부분
            cooldowns.delete(commandName); // 명령어 수행 끝나면 쿨타임 삭제
        } catch (err) {
            cooldowns.delete(commandName); // 에러 발생 시 쿨타임 삭제
            try {
                if (err instanceof Collection) {
                    // awaitMessages에서 시간초과한 경우
                    await interaction.followUp(`'${commandName.split('_')[0]}'의 입력 대기 시간이 초과되었습니다.`);
                } else if (err instanceof MapleError) {
                    await interaction.editReply(err.message);
                } else {
                    replyAdmin(
                        `작성자: ${interaction.user.username}\n방 ID: ${interaction.channelId}\n채팅 내용: ${interaction}\n에러 내용: ${err.stack}`
                    );
                    await interaction.editReply('에러로그가 전송되었습니다.');
                }
            } catch {}
        } finally {
            cachingMessage(interaction); // 들어오는 슬래시 커맨드 항상 캐싱
        }
    }
});
