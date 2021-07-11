/**
 * 모듈 import
 */
const { Client, Collection, clientOption } = require('./util/discord.js-extend'); // 제일 처음에 import 해야하는 모듈
const { readdirSync } = require('fs');
const { TOKEN, PREFIX, ADMIN_ID } = require('./soyabot_config.json');
const { adminChat, initClient, cmd } = require('./admin/admin_function');
const { replyAdmin } = require('./admin/bot_control');
const cachingMessage = require('./util/message_caching');
const botChatting = require('./util/bot_chatting');
const app = require('./util/express_server');
const sqlite = require('./util/sqlite-handler');
globalThis.db = new sqlite('./db/soyabot_data.db'); // db와 client는 여러 기능들에 의해 필수로 최상위 전역
globalThis.client = new Client(clientOption);
client.commands = []; // 명령어 객체 저장할 배열
client.queues = new Map(); // 음악기능 정보 저장용
client.prefix = PREFIX;
const cooldowns = new Set(); // 중복 명령 방지할 set
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 정규식 내부에서 일부 특수 문자를 그대로 취급하기 위해 사용자 입력을 이스케이프로 치환하는 함수
const promiseTimeout = (promise, ms) => Promise.race([promise, new Promise((resolve) => setTimeout(resolve, ms))]);

(async () => {
    try {
        client.botDomain = `${await cmd('curl ifconfig.me', true)}:${app.locals.port}`;
        await client.login(TOKEN);
        await initClient(); // 클라이언트 초기 세팅 함수
        /**
         * 모든 명령 import
         */
        readdirSync('./commands').forEach((file) => {
            if (file.endsWith('.js')) {
                client.commands.push(require(`./commands/${file}`)); // 걸러낸 js파일의 명령 객체를 배열에 push
            }
        });
    } catch (e) {
        console.error(`로그인 에러 발생\n에러 내용: ${e}\n${e.stack ?? e._p}`);
        await cmd('npm stop');
    }
})();
/**
 * 클라이언트 이벤트
 */
client.on('warn', console.log);

client.on('ready', async () => {
    client.user.setActivity(`${client.prefix}help and ${client.prefix}play`, { type: 'LISTENING' });
    replyAdmin(`${client.user.tag}이 작동 중입니다.
${app.locals.port}번 포트에서 http 서버가 작동 중입니다.
재가동 경로: <http://${client.botDomain}/restart/${app.locals.restartPath}>`);
});

client.on('error', (e) => {
    console.error(`클라이언트 에러 발생\n에러 내용: ${e}\n${e.stack ?? e._p}`);
    setTimeout(cmd, 30000, 'npm restart'); // 바로 재가동하면 에러가 반복될 수 있으므로 30초 후 실행을 한다
});

client.on('message', async (message) => {
    // 각 메시지에 반응, 디스코드는 봇의 메시지도 이 이벤트에 들어옴
    let commandName;
    try {
        console.log(`(${new Date().toLocaleString()}) ${message.channel.id} ${message.channel.name} ${message.author.id} ${message.author.username}: ${message.content}\n`);
        if (message.author.bot) {
            // 봇 여부 체크
            return;
        }
        const permissions = message.channel.permissionsFor?.(client.user);
        if (permissions && !permissions.has(['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'])) {
            return; // 기본 권한이 없는 채널이므로 바로 종료
        }
        if (message.author.id === ADMIN_ID) {
            // 관리자 여부 체크
            await adminChat(message);
        }

        const prefixRegex = new RegExp(`^\\s*(<@!?${client.user.id}>|${escapeRegex(client.prefix)})\\s*`); // 문자열로 정규식 생성하기 위해 생성자 이용
        // 멘션의 형태: <@${user.id}>
        const matchedPrefix = prefixRegex.exec(message.content)?.[0]; // 정규식에 대응되는 명령어 접두어 부분을 탐색
        if (!matchedPrefix) {
            // 멘션이나 client.prefix로 시작하지 않는 경우
            return await botChatting(message); // 잡담 로직
        }

        const args = message.content.substr(matchedPrefix.length).trim().split(/\s+/); // 공백류 문자로 메시지 텍스트 분할
        commandName = args.shift().toLowerCase(); // commandName은 args의 첫번째 원소(명령어 부분), shift로 인해 args에는 뒷부분만 남음

        const botModule = client.commands.find((cmd) => cmd.command.includes(commandName)); // 해당하는 명령어 찾기

        if (!botModule) {
            return; // 해당하는 명령어 없으면 종료
        }

        commandName = botModule.channelCool ? `${botModule.command[0]}_${message.channel.id}` : botModule.command[0];

        if (cooldowns.has(commandName)) {
            // 명령이 수행 중인 경우
            return message.channel.send(`"${botModule.command[0]}" 명령을 사용하기 위해 잠시 기다려야합니다.`);
        }
        cooldowns.add(commandName); // 수행 중이지 않은 명령이면 새로 추가한다
        await (botModule.channelCool ? botModule.execute(message, args) : promiseTimeout(botModule.execute(message, args), 300000)); // 명령어 수행 부분
        cooldowns.delete(commandName); // 명령어 수행 끝나면 쿨타임 삭제
    } catch (e) {
        cooldowns.delete(commandName); // 에러 발생 시 쿨타임 삭제
        try {
            if (e instanceof Collection) {
                // awaitMessages에서 시간초과한 경우
                await message.channel.send(`"${commandName.split('_')[0]}"의 입력 대기 시간이 초과되었습니다.`);
            } else if (e.message?.startsWith('메이플')) {
                await message.reply(e.message);
            } else {
                await message.reply('에러로그가 전송되었습니다.');
                replyAdmin(`작성자: ${message.author.username}\n방 ID: ${message.channel.id}\n채팅 내용: ${message.content}\n에러 내용: ${e}\n${e.stack ?? e._p}`);
            }
        } catch {}
    } finally {
        await cachingMessage(message); // 들어오는 채팅 항상 캐싱
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    // 유저 음성채팅 상태 변경 이벤트
    try {
        const oldVoice = oldState?.channel;
        const newVoice = newState?.channel;
        if (oldVoice !== newVoice) {
            console.log(!oldVoice ? 'User joined!' : !newVoice ? 'User left!' : 'User switched channels!');

            if (newVoice) {
                const newQueue = client.queues.get(newVoice.guild.id);
                if (
                    newQueue?.connection.state.status === 'ready' &&
                    !newQueue.playing &&
                    newVoice.id === newQueue.voiceChannel.id &&
                    newVoice.members.size === 2 &&
                    newVoice.members.first().id === client.user.id
                ) {
                    newQueue.playing = true;
                    newQueue.audioPlayer.unpause();
                    newQueue.textSend('대기열을 다시 재생합니다.');
                }
            }

            if (oldVoice) {
                const oldQueue = client.queues.get(oldVoice.guild.id);
                if (oldQueue?.connection.state.status === 'ready' && oldVoice.id === oldQueue.voiceChannel.id && oldVoice.members.size === 1 && oldVoice.members.first().id === client.user.id) {
                    // 봇만 음성 채널에 있는 경우
                    if (oldQueue.playing) {
                        oldQueue.playing = false;
                        oldQueue.audioPlayer.pause();
                        oldQueue.textSend('모든 사용자가 음성채널을 떠나서 대기열을 일시정지합니다.');
                    }
                    setTimeout(() => {
                        const queue = client.queues.get(oldVoice.guild.id);
                        if (queue?.connection.state.status === 'ready' && oldVoice.id === queue.voiceChannel.id && oldVoice.members.size === 1 && oldVoice.members.first().id === client.user.id) {
                            // 5분이 지나도 봇만 음성 채널에 있는 경우
                            queue.textSend(`5분 동안 ${client.user.username}이 비활성화 되어 대기열을 끝냅니다.`);
                            queue.songs = [];
                            queue.audioPlayer.stop(true);
                        }
                    }, 300000);
                }
            }
        }
    } catch (e) {
        replyAdmin(`[oldState]\n${oldState?._p}\n[newState]\n${newState?._p}\n에러 내용: ${e}\n${e.stack ?? e._p}`);
    }
});
