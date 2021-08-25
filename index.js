/**
 * 모듈 import
 */
const { Client, Collection, Permissions, botClientOption } = require('./util/discord.js-extend'); // 제일 처음에 import 해야하는 모듈
const { setTimeout } = require('timers/promises');
const { readdirSync } = require('fs');
const { TOKEN, PREFIX, ADMIN_ID } = require('./soyabot_config.json');
const { adminChat, initClient, cmd } = require('./admin/admin_function');
const { replyAdmin } = require('./admin/bot_control');
const { musicActiveControl, musicButtonControl } = require('./util/music_play');
const cachingMessage = require('./util/message_caching');
const botChatting = require('./util/bot_chatting');
const sqlite = require('./util/sqlite-handler');
globalThis.db = new sqlite('./db/soyabot_data.db'); // db와 client는 여러 기능들에 의해 필수로 최상위 전역
globalThis.client = new Client(botClientOption);
client.commands = []; // 명령어 객체 저장할 배열
client.queues = new Map(); // 음악기능 정보 저장용
client.prefix = PREFIX; // PREFIX는 1글자여야함
const cooldowns = new Set(); // 중복 명령 방지할 set
const promiseTimeout = (promise, ms) => Promise.race([promise, setTimeout(ms)]);

process.on('unhandledRejection', (err) => {
    // node.js v15부터 Unhandled promise rejection이 발생하면 프로세스를 비정상 종료시키므로 처리를 해야함
    console.error('Unhandled promise rejection:', err);
});

(async () => {
    try {
        await client.login(TOKEN);
        await initClient(); // 클라이언트 초기 세팅 함수
        /**
         * 모든 명령 import
         */
        const datas = [];
        readdirSync('./commands').forEach((file) => {
            if (file.endsWith('.js')) {
                const cmd = require(`./commands/${file}`);
                client.commands.push(cmd); // 걸러낸 js파일의 명령 객체를 배열에 push
                if (cmd.commandData) {
                    datas.push(cmd.commandData);
                }
            }
        });
        // await client.application.commands.set(datas); // 인터랙션 데이터 변경 시에만 활성화하기
    } catch (err) {
        console.error('로그인 에러 발생:', err);
        await cmd('npm stop');
    }
})();
/**
 * 클라이언트 이벤트
 */
client.on('warn', console.log);

client.on('ready', async () => {
    client.user.setActivity(`${client.prefix}help and ${client.prefix}play`, { type: 'LISTENING' });
    replyAdmin(`${client.user.tag}이 작동 중입니다.`);
});

client.on('error', async (err) => {
    console.error('클라이언트 에러 발생:', err);
    await setTimeout(30000); // 30초 대기
    await cmd('npm restart'); // 재시작
});

client.on('voiceStateUpdate', musicActiveControl); // 유저 음성채팅 상태 변경 이벤트

client.on('messageCreate', async (message) => {
    // 각 메시지에 반응, 디스코드는 봇의 메시지도 이 이벤트에 들어옴
    let commandName;
    try {
        console.log(
            `(${new Date().toLocaleString()}) ${message.channelId} ${message.channel.name} ${message.author.id} ${message.author.username}: ${
                message.content || message.embeds[0]?.description || ''
            }\n`
        );
        if (message.author.bot) {
            // 봇 여부 체크
            return;
        }
        const permissions = message.channel.permissionsFor?.(message.guild.me);
        if (permissions && !permissions.has([Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.READ_MESSAGE_HISTORY])) {
            return; // 기본 권한이 없는 채널이므로 바로 종료
        }
        if (message.author.id === ADMIN_ID) {
            // 관리자 여부 체크
            await adminChat(message);
        }

        const prefixRegex = new RegExp(`^\\s*${client.prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`); // client.prefix에 이스케이핑 적용 후 정규식 생성

        const matchedPrefix = prefixRegex.exec(message.content)?.[0]; // 정규식에 대응되는 명령어 접두어 부분을 탐색
        if (!matchedPrefix) {
            // 멘션이나 client.prefix로 시작하지 않는 경우
            return await botChatting(message); // 잡담 로직
        }

        const args = message.content.substr(matchedPrefix.length).trim().split(/\s+/); // 공백류 문자로 메시지 텍스트 분할
        commandName = args.shift().toLowerCase(); // commandName은 args의 첫번째 원소(명령어 부분), shift로 인해 args에는 뒷부분만 남음

        const botModule = client.commands.find((cmd) => cmd.command.includes(commandName)); // 해당하는 명령어 찾기

        if (!botModule?.messageExecute) {
            return; // 해당하는 명령어 없으면 종료
        }

        commandName = botModule.channelCool ? `${botModule.command[0]}_${message.channelId}` : botModule.command[0];

        if (cooldowns.has(commandName)) {
            // 명령이 수행 중인 경우
            return message.channel.send(`"${botModule.command[0]}" 명령을 사용하기 위해 잠시 기다려야합니다.`);
        }
        cooldowns.add(commandName); // 수행 중이지 않은 명령이면 새로 추가한다
        await (botModule.channelCool ? botModule.messageExecute(message, args) : promiseTimeout(botModule.messageExecute(message, args), 300000)); // 명령어 수행 부분
        cooldowns.delete(commandName); // 명령어 수행 끝나면 쿨타임 삭제
    } catch (err) {
        cooldowns.delete(commandName); // 에러 발생 시 쿨타임 삭제
        try {
            if (err instanceof Collection) {
                // awaitMessages에서 시간초과한 경우
                await message.channel.send(`"${commandName.split('_')[0]}"의 입력 대기 시간이 초과되었습니다.`);
            } else if (err.message?.startsWith('메이플')) {
                await message.reply(err.message);
            } else {
                await message.reply('에러로그가 전송되었습니다.');
                replyAdmin(`작성자: ${message.author.username}\n방 ID: ${message.channelId}\n채팅 내용: ${message.content}\n에러 내용: ${err.stack ?? err._p}`);
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
                `(${new Date().toLocaleString()}) ${interaction.channelId} ${interaction.channel.name} ${interaction.user.id} ${interaction.user.username}: /${
                    interaction.commandName
                }\n${interaction.options._i()}\n`
            );

            const permissions = interaction.channel.permissionsFor?.(interaction.guild.me);
            if (permissions && !permissions.has([Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.READ_MESSAGE_HISTORY])) {
                return; // 기본 권한이 없는 채널이므로 바로 종료
            }

            const botModule = client.commands.find((cmd) => cmd.commandData?.name === commandName); // 해당하는 명령어 찾기

            if (!botModule?.commandExecute) {
                return; // 해당하는 명령어 없으면 종료
            }

            commandName = botModule.channelCool ? `${commandName}_${interaction.channelId}` : commandName;

            if (cooldowns.has(commandName)) {
                // 명령이 수행 중인 경우
                return interaction.followUp(`"${botModule.command[0]}" 명령을 사용하기 위해 잠시 기다려야합니다.`);
            }
            cooldowns.add(commandName); // 수행 중이지 않은 명령이면 새로 추가한다
            await (botModule.channelCool ? botModule.commandExecute(interaction) : promiseTimeout(botModule.commandExecute(interaction), 300000)); // 명령어 수행 부분
            cooldowns.delete(commandName); // 명령어 수행 끝나면 쿨타임 삭제
        } catch (err) {
            cooldowns.delete(commandName); // 에러 발생 시 쿨타임 삭제
            try {
                if (err instanceof Collection) {
                    // awaitMessages에서 시간초과한 경우
                    await interaction.followUp(`"${commandName.split('_')[0]}"의 입력 대기 시간이 초과되었습니다.`);
                } else if (err.message?.startsWith('메이플')) {
                    await interaction.editReply(err.message);
                } else {
                    await interaction.editReply('에러로그가 전송되었습니다.');
                    replyAdmin(
                        `작성자: ${interaction.user.username}\n방 ID: ${interaction.channelId}\n채팅 내용: /${interaction.commandName}\n${interaction.options._i()}\n에러 내용: ${err.stack ?? err._p}`
                    );
                }
            } catch {}
        } finally {
            cachingMessage(interaction); // 들어오는 슬래시 커맨드 항상 캐싱
        }
    }
});
