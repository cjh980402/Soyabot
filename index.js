/**
 * Module Imports
 */
const { Client, Collection } = require("discord.js");
const cachingMessage = require('./util/message_caching');
const { readdirSync } = require("fs");
const { TOKEN, PREFIX, ADMIN_ID, STAY_TIME } = require("./config.json");
const admin = require("./admin/admin_function");
const { startNotice, startUpdate, startTest, startTestPatch, startFlag } = require('./admin/maple_auto_notice.js');
const botChatting = require("./util/bot_chatting");
const { replyAdmin } = require('./admin/bot_control');
const dbhandler = require('./util/sqlite-handler');
global.db = new dbhandler('./db/soyabot_data.db');
global.client = new Client({ disableMentions: "everyone" }); // 여러 기능들에 의해 필수로 최상위 전역
client.login(TOKEN);
client.commands = new Array(); // 명령어 객체 저장할 배열
client.prefix = PREFIX;
client.queue = new Map();
client.setMaxListeners(20); // 이벤트 개수 제한 증가
const cooldowns = new Set(); // 중복 명령 방지할 set
const userExit = {};
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // 사용자 입력을 이스케이프해서 정규식 내부에서 문자 그대로 취급하기 위해 치환하는 함수
const promiseTimeout = (promise, ms) => Promise.race([promise, new Promise((resolve, reject) => setTimeout(() => reject(new Error("명령어 시간 초과")), ms))]);

/**
 * Client Events
 */
client.on("ready", async () => {
    console.log(`${client.user.username} ready!`);
    client.user.setActivity(`${PREFIX}help and ${PREFIX}play`, { type: "LISTENING" });
    /**
     * Import all commands
     */
    readdirSync("./commands").filter((file) => file.endsWith(".js")).forEach(file => { // commands 폴더속 .js 파일 걸러내기
        client.commands.push(require(`./commands/${file}`)); // 배열에 이름과 명령 객체를 push
    });
    client.suggestionChat = {};
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
    startNotice(); // 공지 자동 알림 기능
    startUpdate(); // 업데이트 자동 알림 기능
    startTest(); // 테섭 자동 알림 기능
    startTestPatch(); // 테섭 패치 감지 기능
    startFlag(); // 플래그 5분 전 알림
});
client.on("warn", console.log);
client.on("error", console.error);

client.on("message", async (message) => { // 각 메시지에 반응, 디스코드는 봇의 채팅도 이 이벤트에 들어와서 봇 채팅 캐싱도 같이됨
    let commandName;
    try {
        console.log(`(${new Date().toKorean()}) ${message.channel.id} ${message.channel.name} ${message.author.id} ${message.author.username}: ${message.content}\n`);
        if (message.author.bot) { // 봇 여부 체크
            return;
        }
        if (message.author.id == ADMIN_ID) { // 관리자 여부 체크
            await admin(message);
        }

        const prefixRegex = new RegExp(`^\\s*(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`); // 문자열로 정규식 생성하기 위해 생성자 이용
        // 자기자신한테 하는 멘션 또는 PREFIX로 시작하는 명령어에 대응
        // message.content : 메시지 내용 텍스트
        // 멘션의 형태 : <@${user.id}>, 인용의 형태 : > ${내용}
        const matchedPrefix = prefixRegex.exec(message.content); // 정규식에 대응되는 명령어 접두어 부분을 탐색
        if (!matchedPrefix) {
            return botChatting(message); // 잡담 로직
        } // 멘션이나 PREFIX로 시작하지 않는 경우

        const args = message.content.slice(matchedPrefix[0].length).trim().split(/\s+/); // 공백류 문자로 메시지 텍스트 분할
        commandName = args.shift().toLowerCase(); // commandName은 args의 첫번째 원소(명령어 부분), shift로 인해 args에는 뒷부분만 남음

        const botModule = client.commands.find((cmd) => cmd.command.includes(commandName));
        // 해당하는 명령어 찾기

        if (!botModule) {
            return; // 해당하는 명령어 없으면 종료
        }

        commandName = botModule.browser ? "브라우저" : (botModule.channelCool ? `${botModule.command[0]}_${message.channel.id}` : botModule.command[0]);

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
        else if (e.message.startsWith('메이플')) {
            message.reply(e.message);
        }
        else {
            message.reply("에러로그가 전송되었습니다.");
            replyAdmin(`작성자: ${message.author.username}\n방 ID: ${message.channel.id}\n채팅 내용: ${message.content}\n에러 내용: ${e}\n${e.stack}`);
        }
    }
    finally {
        await cachingMessage(message);
    }
});

client.on("voiceStateUpdate", (oldState, newState) => {
    const oldVoice = oldState.channel;
    const newVoice = newState.channel;
    try {
        if (oldVoice != newVoice) {
            if (oldVoice == null) {
                console.log("User joined!");
                if (userExit[newVoice.guild.id] && userExit[newVoice.guild.id][1] > Date.now()) {
                    const queue = client.queue.get(newVoice.guild.id);
                    queue.connection.dispatcher.resume(); // 지연시간 내에 다시 들어오면 대기열 재생
                    queue.playing = true;
                    userExit[newVoice.guild.id] = null;
                }
            }
            else {
                console.log(newVoice ? "User switched channels!" : "User left!");
                const queue = client.queue.get(oldVoice.guild.id);
                if (queue && queue.connection.dispatcher && oldVoice == queue.channel && oldVoice.members.size == 1) { // 봇만 음성 채널에 있는 경우
                    if (queue.playing) {
                        queue.connection.dispatcher.pause(true);
                        queue.playing = false;
                    } // 처음엔 일시정지 처리
                    userExit[oldVoice.guild.id] = [oldVoice, Date.now() + STAY_TIME * 1000];
                    setTimeout(() => {
                        if (queue.connection.dispatcher && oldVoice.members.size == 1) {
                            queue.songs = [];
                            queue.connection.dispatcher.end(); // 지연시간 후에도 아무도 없으면 대기열 종료
                            userExit[oldVoice.guild.id] = null;
                        }
                    }, STAY_TIME * 1000);
                    queue.textChannel.send("모든 사용자가 음성채널을 떠났습니다.");
                }
            }
        }
    }
    catch (e) {
        replyAdmin(`작성자: ${(oldVoice || newVoice).member.user.username}\n방 이름: ${(oldVoice || newVoice).guild.name}\n에러 내용: ${e}\n${e.stack}`);
    }
});
