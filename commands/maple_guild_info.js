const fetch = require('node-fetch');
const cheerio = require('cheerio');
const mapleModule = require("../util/maple_parsing");
const serverEngName = {
    "스카니아": "scania",
    "베라": "bera",
    "루나": "luna",
    "제니스": "zenith",
    "크로아": "croa",
    "유니온": "union",
    "엘리시움": "elysium",
    "이노시스": "enosis",
    "레드": "red",
    "오로라": "aurora",
    "아케인": "arcane",
    "노바": "nova",
    "리부트": "reboot",
    "리부트2": "reboot2"
};

module.exports = {
    usage: `${client.prefix}길드 (서버 이름) (길드 이름)`,
    command: ["길드", "ㄱㄷ"],
    description: '- 입력한 내용에 해당하는 길드의 길드원 정보를 보여줍니다.',
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 2 || !serverEngName[args[0]]) {
            return message.channel.send(`${this.usage}\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const parse = cheerio.load(await (await fetch(encodeURI(`https://maple.gg/guild/${serverEngName[args[0]]}/${args[1]}/members?sort=level`))).text());
        const memberData = parse(".pt-2.bg-white.rounded.border.font-size-0.line-height-1");
        const memberCount = memberData.length;
        if (memberCount == 0) {
            return message.channel.send("존재하지 않는 길드입니다.");
        }

        message.channel.send("정보 가져오는 중...");
        let rslt = `${args[0]} ${args[1]} 길드 (${memberCount}명)`;
        for (let i = 0; i < memberCount; i++) {
            const name = memberData.eq(i).find(".mb-2 a").eq(1).text();
            const Maple = new mapleModule(name);
            const union = (await Maple.homeUnion())?.[0];
            if (await Maple.isLatest()) {
                rslt += "\n\n[갱신 성공] ";
            }
            else {
                rslt += (await Maple.updateGG() ? "\n\n[갱신 성공] " : "\n\n[갱신 실패] ");
            }
            const murung = Maple.Murung()?.[1];
            rslt += `\n\n${memberData.eq(i).find("header > span").text() || "길드원"}: ${name}, ${memberData.eq(i).find(".mb-2 span").text()}, 유니온: ${union?.toLocaleString() ?? "-"}, 무릉: ${murung ?? "-"} (${memberData.eq(i).find(".user-summary-date").text()})`;
        }
        return message.channel.send(rslt, { split: true });
    }
};