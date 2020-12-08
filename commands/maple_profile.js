const { MessageAttachment } = require("discord.js");
const puppeteer = require('puppeteer');
const mapleModule = require("../util/maple_parsing");

module.exports = {
    usage: `${client.prefix}프로필 (닉네임)`,
    command: ["프로필", "ㅍㄹㅍ", "ㅍㄿ"],
    description: "- 캐릭터의 메이플 gg 프로필을 출력합니다.",
    browser: true,
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const Maple = new mapleModule(args[0]);
        if (!(await Maple.isExist()) || !Maple.homeLevel()) {
            return message.channel.send(`[${Maple.Name}]\n존재하지 않는 캐릭터입니다.`);
        }
        if (!(await Maple.isLatest())) {
            message.channel.send('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await Maple.updateGG())) {
                message.channel.send('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }

        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

        const page = await browser.newPage();
        page.setViewport({ width: 1400, height: 1000 }); // 화면이 넓어야 버튼을 눌러도 스크롤 시점이 이동을 안함
        await page.goto(Maple.GGURL);
        await page.click('.btn.btn-grape-fruit');
        await page.waitForTimeout(1000); // 1초 기다리기
        const box = await (await page.$('.character-card')).boundingBox();
        const attachment = new MessageAttachment(await page.screenshot({ clip: { x: box.x, y: box.y + 3, width: box.width, height: box.height } }), 'profile.png');
        // 사진 자체가 아래로 치우쳤기에 3픽셀 보정
        await browser.close();
        return message.channel.send(`${Maple.Name}님의 프로필`, {
            files: [attachment]
        });
    }
};
