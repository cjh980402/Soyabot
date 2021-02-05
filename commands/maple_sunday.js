const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = {
    usage: `${client.prefix}썬데이`,
    command: ["썬데이", "ㅆㄷㅇ"],
    description: "- 현재 진행 (예정) 중인 썬데이 메이플을 공지합니다.",
    type: ["메이플"],
    async execute(message) {
        const parse = cheerio.load(await (await fetch("https://maplestory.nexon.com/News/Event")).text());
        const eventdata = parse(".event_all_banner li dl dt a");
        const sunday = eventdata.filter((i, v) => /^썬데이\s*메이플$/.test(parse(v).text())).attr("href");
        if (!sunday) {
            return message.channel.send('썬데이 메이플 공지가 아직 없습니다.');
        }

        const imgLink = cheerio.load(await (await fetch(`https://maplestory.nexon.com${sunday}`)).text())("img[alt='썬데이 메이플!']").attr("src");
        return message.channel.send({
            files: [imgLink]
        });
    }
};