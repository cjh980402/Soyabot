const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = {
    usage: `${client.prefix}썬데이`,
    command: ["썬데이", "ㅆㄷㅇ"],
    description: "- 현재 진행 (예정) 중인 썬데이 메이플을 공지",
    type: ["메이플"],
    async execute(message) {
        const parse = cheerio.load(await (await fetch("https://maplestory.nexon.com/News/Event")).text());
        const eventdata = parse('.event_all_banner');
        const links = eventdata.find("li dl dt a").map((i, v) => parse(v).attr("href"));
        const names = eventdata.find("li dl dt a").map((i, v) => parse(v).text());
        let index = -1;
        for (let i in names) { // 목록을 돌며 썬데이가 있는지 확인
            if (names[i] == '썬데이메이플' || names[i] == '썬데이 메이플') {
                index = i;
                break;
            }
        }
        if (index == -1) {
            return message.channel.send('썬데이메이플 공지가 아직 없습니다.');
        }
        else {
            const imgLink = cheerio.load(await (await fetch(`https://maplestory.nexon.com${links[index]}`)).text())("img[alt='썬데이 메이플!']").attr("src");
            message.channel.send({
                files: [imgLink]
            });
        }
    }
};
