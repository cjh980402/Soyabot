/**
 * Module Imports
 */
const { Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const { TOKEN, PREFIX, ADMIN_ID } = require("./config.json");
const cmd = require("./admin/admin_function");
const puppeteer = require('puppeteer');

const client = new Client({ disableMentions: "everyone" });

client.login(TOKEN);
client.commands = new Collection();
client.prefix = PREFIX;
client.queue = new Map();
const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // 사용자 입력을 이스케이프해서 정규식 내부에서 문자 그대로 취급하기 위해 치환하는 함수

/**
 * Client Events
 */
client.on("ready", async () => {
    console.log(`${client.user.username} ready!`);
    client.user.setActivity(`${PREFIX}help`);
    global.browser = await puppeteer.launch();
});
client.on("warn", (info) => console.log(info));
client.on("error", console.error);

/**
 * Import all commands
 */
const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js")); // commands 폴더속 .js 파일 걸러내기
for (const file of commandFiles) {
    const command = require(join(__dirname, "commands", `${file}`)); // 위에서 걸러낸 파일을 모두 require
    client.commands.set(command.name, command); // Collection에 이름과 객체를 set
}

client.on("message", async (message) => { // 각 메시지에 반응
    if (message.author.bot) return; // 봇 여부 체크

    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`); // 문자열로 정규식 생성하기 위해 생성자 이용
    // 자기자신한테 하는 멘션 또는 PREFIX로 시작하는 명령어에 대응
    // message.content : 메시지 내용 텍스트
    if (!prefixRegex.test(message.content)) { // 멘션이나 PREFIX로 시작하지 않는 경우
        if (message.author.id == ADMIN_ID) { // 관리자 여부 체크
            try {
                if (message.content.indexOf("<") == 0) { // 노드 코드 실행
                    message.channel.send(String(eval(message.content.substr(1))));
                }
                else if (message.content.indexOf(">") == 0) { // 콘솔 명령 실행
                    message.channel.send(cmd(message.content.substr(1)));
                }
            }
            catch (e) {
                message.channel.send(`채팅 내용 : ${message.content}\n에러 내용 : ${e}\n${e.stack}`);
            }
        }
        return;
    }

    const [, matchedPrefix] = message.content.match(prefixRegex); // ()로 감싸진 명령어 부분에 대응

    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/); // 공백으로 메시지 텍스트 분할
    const commandName = args.shift().toLowerCase(); // cmmandName은 args의 첫번째 원소(명령어 부분), shift로 인해 args에는 뒷부분만 남음

    const command =
        client.commands.get(commandName) ||
        client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
    // 해당하는 명령어 찾기 (이름으로 또는 추가 명령어로 찾음)

    if (!command) return; // 해당하는 명령어 없으면 종료

    if (!cooldowns.has(command.name)) { // 사용된 적이 없는 명령이면 새로 set한다
        cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name); // Collection 객체
    const cooldownAmount = (command.cooldown || 1) * 1000; // 명시된 쿨타임이 없다면 1초로 취급

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount; // 지난 명령 이후 쿨타임이 다 지난 시간

        if (now < expirationTime) { // 아직 다 지나지 않은 경우
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(
                `\`${command.name}\`명령을 사용하기 위해 ${timeLeft.toFixed(1)}초 이상 기다려야합니다.`
            );
        }
    }

    timestamps.set(message.author.id, now); // id와 현재시간 저장, 객체는 참조형이므로 cooldowns의 value에 추가됨
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount); // 쿨타임 지나면 삭제

    try {
        command.execute(message, args); // 실질적인 명령어 수행 부분
    } catch (error) {
        console.error(error);
        message.reply("명령어를 실행하던 중 에러가 발생하였습니다.").catch(console.error);
    }
});
