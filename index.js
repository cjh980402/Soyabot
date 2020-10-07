/**
 * Module Imports
 */
const { Client } = require("discord.js");
const { readdirSync } = require("fs");
const { TOKEN, PREFIX, ADMIN_ID } = require("./config.json");
const admin = require("./admin/admin_function");
const dbhandler = require('./util/db-handler');
const db = new dbhandler('./db/soyabot_data.db');
const { startNotice, startUpdate, startTest, startTestPatch, startFlag } = require('./admin/maple_auto_notice.js');
const botChatting = require("./util/bot_chatting");

const client = new Client({ disableMentions: "everyone" });

client.login(TOKEN);
client.commands = new Array(); // 명령어 객체 저장할 배열
client.prefix = PREFIX;
client.queue = new Map();
const cooldowns = new Set(); // 중복 명령 방지할 set
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // 사용자 입력을 이스케이프해서 정규식 내부에서 문자 그대로 취급하기 위해 치환하는 함수

/**
 * Client Events
 */
client.on("ready", async () => {
    console.log(`${client.user.username} ready!`);
    client.user.setActivity(`${PREFIX}help`, { type: 'LISTENING' });
    global.client = client; // 여러 기능들에 의해 필수
    global.db = db;
    await db.run('CREATE TABLE IF NOT EXISTS maplenotice(title text primary key, url text not null)');
    await db.run('CREATE TABLE IF NOT EXISTS mapleupdate(title text primary key, url text not null)');
    await db.run('CREATE TABLE IF NOT EXISTS mapletest(title text primary key, url text not null)');
    await db.run('CREATE TABLE IF NOT EXISTS noticeskip(channelid text primary key, name text not null)');
    await db.run('CREATE TABLE IF NOT EXISTS updateskip(channelid text primary key, name text not null)');
    await db.run('CREATE TABLE IF NOT EXISTS flagskip(channelid text primary key, name text not null)');
    await db.run('CREATE TABLE IF NOT EXISTS testskip(channelid text primary key, name text not null)');
    await db.run('CREATE TABLE IF NOT EXISTS testpatchskip(channelid text primary key, name text not null)');
    startNotice(); // 공지 자동 알림 기능
    startUpdate(); // 업데이트 자동 알림 기능
    startTest(); // 테섭 자동 알림 기능
    startTestPatch(); // 테섭 패치 감지 기능
    startFlag(); // 플래그 5분 전 알림
    /**
     * Import all commands
     */
    const commandFiles = readdirSync("./commands").filter((file) => file.endsWith(".js")); // commands 폴더속 .js 파일 걸러내기
    for (const file of commandFiles) {
        client.commands.push(require(`./commands/${file}`)); // 배열에 이름과 명령 객체를 push
    }
});
client.on("warn", (info) => console.log(info));
client.on("error", console.error);

client.on("message", async (message) => { // 각 메시지에 반응
    let commandName;
    try {
        if (message.author.bot) return; // 봇 여부 체크
        if (message.author.id == ADMIN_ID) { // 관리자 여부 체크
            await admin(message);
        }

        const prefixRegex = new RegExp(`^\\s*(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`); // 문자열로 정규식 생성하기 위해 생성자 이용
        // 자기자신한테 하는 멘션 또는 PREFIX로 시작하는 명령어에 대응
        // message.content : 메시지 내용 텍스트
        // 멘션의 형태 : <@${message.author.id}>, 인용의 형태 : > ${내용}
        if (!prefixRegex.test(message.content)) {
            return botChatting(message); // 잡담 로직
        } // 멘션이나 PREFIX로 시작하지 않는 경우

        const [matchedPrefix] = message.content.match(prefixRegex); // 정규식에 대응되는 명령어 접두어 부분에 대응

        const args = message.content.slice(matchedPrefix.length).trim().split(/\s+/); // 공백류 문자로 메시지 텍스트 분할
        commandName = args.shift().toLowerCase(); // commandName은 args의 첫번째 원소(명령어 부분), shift로 인해 args에는 뒷부분만 남음

        const botModule = client.commands.find((cmd) => cmd.command.includes(commandName));
        // 해당하는 명령어 찾기 (이름으로 또는 추가 명령어로 찾음)

        if (!botModule) return; // 해당하는 명령어 없으면 종료

        const browserModule = ["프로필", "컬렉션", "날씨"];
        commandName = browserModule.includes(botModule.command[0]) ? "브라우저" : botModule.command[0];

        if (cooldowns.has(commandName)) { // 명령이 수행 중인 경우
            return message.reply(`"${botModule.command[0]}" 명령을 사용하기 위해 잠시 기다려야합니다.`);
        }

        cooldowns.add(commandName); // 수행 중이지 않은 명령이면 새로 추가한다
        await botModule.execute(message, args); // 실질적인 명령어 수행 부분, 일부 비동기 모듈때문에 await를 붙인다.
        cooldowns.delete(commandName); // 명령어 수행 끝나면 쿨타임 삭제
    }
    catch (error) {
        cooldowns.delete(commandName); // 에러 발생 시 쿨타임 삭제
        if (error.message.startsWith('maple.GG'))
            message.reply(e.message);
        else {
            const adminchat = client.channels.cache.array().find(v => v.recipient == ADMIN_ID);
            if (adminchat)
                adminchat.sendFullText(`작성자 : ${message.author.username}\n방 ID : ${message.channel.id}\n채팅 내용 : ${message.content}\n에러 내용 : ${error}\n${error.stack}`);
            message.reply("에러로그가 전송되었습니다.");
        }
    }
});

client.on("voiceStateUpdate", (oldState, newState) => {
    const oldVoice = oldState.channel;
    const newVoice = newState.channel;
    if (oldVoice != newVoice) {
        if (oldVoice == null) {
            console.log("User joined!");
        }
        else if (newVoice == null) {
            console.log("User left!");
            const queue = client.queue.get(oldVoice.guild.id);
            if (queue && oldVoice == queue.channel && oldVoice.members.size == 1) { // 봇만 음성 채널에 있는 경우
                queue.textChannel.send("모든 사용자가 음성채널을 떠나서 노래가 끝났습니다.");
                if (queue.collector)
                    queue.collector.stop();
                queue.channel.leave();
                client.queue.delete(oldVoice.guild.id);
            }
        }
        else {
            console.log("User switched channels!");
        }
    }
});
