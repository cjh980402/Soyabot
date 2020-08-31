const mapleModule = require("../util/maple_parsing");
const puppeteer = require('puppeteer');

module.exports = {
    name: "프로필",
    aliases: ["ㅍㄿ", "ㅍㄹㅍ"],
    description: "캐릭터의 메이플 gg 프로필을 출력",
    type: ["메이플"],
    async execute(message, args) {
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

        if (!browser.isConnected())
            browser = await puppeteer.launch();
        const page = await browser.newPage();
        page.setViewport({ width: 1400, height: 1000 }); // 화면이 넓어야 버튼을 눌러도 스크롤 시점이 이동을 안함
        await page.goto(`https://maple.gg/u/${args[0]}`);
        try {
            await page.click('.btn.btn-grape-fruit');
            await page.waitFor(1000); // 1초 기다리기
            const box = await (await page.$('.character-card')).boundingBox();
            await page.screenshot({ path: './pictures/maplegg.png', clip: { x: box.x, y: box.y + 3, width: box.width, height: box.height } });
            // 사진 자체가 아래로 치우쳤기에 3픽셀 보정
        }
        catch (e) {
            console.log('에러발생');
            message.channel.send(`[${args[0]}]\n존재하지 않는 캐릭터입니다.`);
        }
        finally {
            await page.close();
        }
        message.channel.send(`${args[0]}님의 프로필`, {
            files: [
                "./pictures/maplegg.png"
            ]
        });
    }
};
