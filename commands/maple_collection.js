const { MessageAttachment } = require("discord.js");
const puppeteer = require('puppeteer');
const mapleModule = require("../util/maple_parsing");

module.exports = {
    usage: `${client.prefix}컬렉션 (닉네임)`,
    command: ["컬렉션", "ㅋㄹㅅ", "ㅋㄽ"],
    description: "- 캐릭터의 메이플 gg 코디 컬렉션을 출력합니다.",
    browser: true,
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const Maple = new mapleModule(args[0]);
        if ((await Maple.isExist()) == null || Maple.homeLevel() == null) {
            return message.channel.send(`[${args[0]}]\n존재하지 않는 캐릭터입니다.`);
        }
        if (!(await Maple.isLatest())) {
            message.channel.send('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await Maple.updateGG())) {
                message.channel.send('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }

        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        page.setViewport({ width: 500, height: 800 }); // 화면이 좁아야 코디 컬렉션이 세로로 길게 나옴
        try {
            await page.goto(Maple.GGURL);
            const attachment = new MessageAttachment(await (await page.$('section.box.mt-3')).screenshot(), 'collection.png');
            return message.channel.send(`${Maple.Name}님의 코디 컬렉션`, {
                files: [attachment]
            });
        }
        catch (e) {
            return message.channel.send(`${Maple.Name}님의 코디 컬렉션을 가져오지 못하였습니다.`);
        }
        finally {
            await browser.close();
        }
    }
};
