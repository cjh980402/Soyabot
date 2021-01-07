/**
 * 모듈 import
 */
const { Client, Collection } = require("discord.js");
const cachingMessage = require('./util/message_caching');
const { readdirSync } = require("fs");
const { TOKEN, PREFIX, ADMIN_ID } = require("./soyabot_config.json");
const { adminChat, initClient } = require("./admin/admin_function");
const botChatting = require("./util/bot_chatting");
const { replyAdmin } = require('./admin/bot_control');
const server = require("./util/express_server");
const sqlite = require('./util/sqlite-handler');
global.db = new sqlite('./db/soyabot_data.db'); // 여러 기능들에 의해 필수로 최상위 전역
global.client = new Client({ disableMentions: "everyone" });
client.login(TOKEN);
client.commands = []; // 명령어 객체 저장할 배열
client.queue = new Map(); // 음악기능 정보 저장용
client.prefix = PREFIX;
const cooldowns = new Set(); // 중복 명령 방지할 set
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // 사용자 입력을 이스케이프해서 정규식 내부에서 문자 그대로 취급하기 위해 치환하는 함수
const promiseTimeout = (promise, ms) => Promise.race([promise, new Promise((resolve, reject) => setTimeout(() => reject(new Error("명령어 시간 초과")), ms))]);
/**
 * 클라이언트 이벤트
 */
client.on("ready", async () => {
    await initClient(); // 클라이언트 초기 세팅 함수
    /**
     * 모든 명령 import
     */
    readdirSync("./commands").filter((file) => file.endsWith(".js")).forEach((file) => { // commands 폴더속 .js 파일 걸러내기
        client.commands.push(require(`./commands/${file}`)); // 배열에 이름과 명령 객체를 push
    });
    client.user.setActivity(`${PREFIX}help and ${PREFIX}play`, { type: "LISTENING" });
    replyAdmin(`소야봇이 작동 중입니다.\n${server.address().port}번 포트에서 http 서버가 작동 중입니다.`);
});
client.on("warn", console.log);
client.on("error", console.error);

client.on("message", async (message) => { // 각 메시지에 반응, 디스코드는 봇의 채팅도 이 이벤트에 들어옴
    let commandName;
    try {
        console.log(`(${new Date().toLocaleString()}) ${message.channel.id} ${message.channel.name} ${message.author.id} ${message.author.username}: ${message.content}\n`);
        if (message.author.bot) { // 봇 여부 체크
            return;
        }
        if (message.author.id == ADMIN_ID) { // 관리자 여부 체크와 채팅 종류 검사
            await adminChat(message);
        }

        const prefixRegex = new RegExp(`^\\s*(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`); // 문자열로 정규식 생성하기 위해 생성자 이용
        // 자기자신한테 하는 멘션 또는 PREFIX로 시작하는 명령어에 대응
        // message.content: 메시지 내용 텍스트
        // 멘션의 형태: <@${user.id}>, 인용의 형태: > ${내용}
        const matchedPrefix = prefixRegex.exec(message.content)?.[0]; // 정규식에 대응되는 명령어 접두어 부분을 탐색
        if (!matchedPrefix) { // 멘션이나 PREFIX로 시작하지 않는 경우
            return botChatting(message); // 잡담 로직
        }

        const args = message.content.slice(matchedPrefix.length).trim().split(/\s+/); // 공백류 문자로 메시지 텍스트 분할
        commandName = args.shift().toLowerCase(); // commandName은 args의 첫번째 원소(명령어 부분), shift로 인해 args에는 뒷부분만 남음

        const botModule = client.commands.find((cmd) => cmd.command.includes(commandName)); // 해당하는 명령어 찾기

        if (!botModule) {
            return; // 해당하는 명령어 없으면 종료
        }

        commandName = botModule.browser ? "browser" : (botModule.channelCool ? `${botModule.command[0]}_${message.channel.id}` : botModule.command[0]);

        if (cooldowns.has(commandName)) { // 명령이 수행 중인 경우
            return message.reply(`"${botModule.command[0]}" 명령을 사용하기 위해 잠시 기다려야합니다.`);
        }
        cooldowns.add(commandName); // 수행 중이지 않은 명령이면 새로 추가한다
        await (botModule.channelCool ? botModule.execute(message, args) : promiseTimeout(botModule.execute(message, args), 180000)); // 명령어 수행 부분
        cooldowns.delete(commandName); // 명령어 수행 끝나면 쿨타임 삭제
    }
    catch (e) {
        cooldowns.delete(commandName); // 에러 발생 시 쿨타임 삭제
        if (e instanceof Collection) { // awaitMessages에서 시간초과한 경우
            message.channel.send(`"${commandName.split("_")[0]}"의 입력 대기 시간이 초과되었습니다.`);
        }
        else if (e.message?.startsWith('메이플')) {
            message.reply(e.message);
        }
        else {
            message.reply("에러로그가 전송되었습니다.");
            replyAdmin(`작성자: ${message.author.username}\n방 ID: ${message.channel.id}\n채팅 내용: ${message.content}\n에러 내용: ${e}\n${e.stack ?? e.$}`);
        }
    }
    finally {
        await cachingMessage(message); // 들어오는 채팅 항상 캐싱
    }
});

client.on("voiceStateUpdate", (oldState, newState) => { // 유저 음성채팅 상태 변경 이벤트
    const oldVoice = oldState.channel;
    const newVoice = newState.channel;
    if (oldVoice != newVoice) {
        console.log(!oldVoice ? "User joined!" : (!newVoice ? "User left!" : "User switched channels!"));

        if (newVoice) {
            const newQueue = client.queue.get(newVoice.guild.id);
            if (newQueue?.connection && !newQueue.playing && newVoice == newQueue.channel && newVoice.members.size == 2) {
                newQueue.connection.dispatcher?.resume();
                newQueue.TextChannel.send("대기열을 다시 재생합니다.");
                newQueue.playing = true;
            }
        }

        if (oldVoice) {
            const oldQueue = client.queue.get(oldVoice.guild.id);
            if (oldQueue?.connection && oldVoice == oldQueue.channel && oldVoice.members.size == 1) { // 봇만 음성 채널에 있는 경우
                if (oldQueue.playing) {
                    oldQueue.connection.dispatcher?.pause(true);
                    oldQueue.TextChannel.send("모든 사용자가 음성채널을 떠나서 대기열을 일시정지합니다.");
                    oldQueue.playing = false;
                }
                setTimeout(() => {
                    const queue = client.queue.get(oldVoice.guild.id);
                    if (queue?.connection && oldVoice == queue.channel && oldVoice.members.size == 1) { // 5분이 지나도 봇만 음성 채널에 있는 경우
                        queue.songs = [];
                        queue.connection.dispatcher?.end();
                        queue.TextChannel.send("5분 동안 소야봇이 비활성화 되어 대기열을 끝냅니다.");
                    }
                }, 300000);
            }
        }
    }
});
