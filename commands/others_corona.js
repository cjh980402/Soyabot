const { OPEN_API_KEY } = require('../soyabot_config.json');
const { MessageEmbed } = require("../util/discord.js-extend");
const fetch = require('node-fetch');
const cheerio = require('cheerio');

function calcIncrease($, selector) {
    const today = +$(selector).eq(0).text();
    const dateList = $("stateDt");
    const yesterday = +$(selector).filter((i) => dateList.eq(i).text() != dateList.eq(0).text()).eq(0).text();
    return `${today.toLocaleString()} (${(today >= yesterday) ? `⬆️ ${(today - yesterday).toLocaleString()}` : `⬇️ ${(yesterday - today).toLocaleString()}`})`;
}

module.exports = {
    usage: `${client.prefix}코로나2`,
    command: ["코로나2", "ㅋㄹㄴ2"],
    description: '- 최신 기준 코로나 국내 현황을 알려줍니다.',
    type: ["기타"],
    async execute(message) {
        const today = new Date();
        const startday = new Date(Date.now() - 604800000); // 일주일 전을 시작일로 설정
        const params = new URLSearchParams();
        params.append("serviceKey", OPEN_API_KEY);
        params.append("pageNo", "1");
        params.append("numOfRows", "10");
        params.append("startCreateDt", `${startday.getFullYear()}${String(startday.getMonth() + 1).padStart(2, '0')}${String(startday.getDate()).padStart(2, '0')}`);
        params.append("endCreateDt", `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`);
        const $ = cheerio.load(await (await fetch(`http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19InfStateJson?${params}`)).text(), { xmlMode: true });

        if ($("resultCode").text() == "00") {
            const coronaEmbed = new MessageEmbed()
                .setTitle(`**${new Date($("createDt").eq(0).text()).toLocaleDateString()} 00시 기준**`)
                .setThumbnail("http://140.238.26.231:8170/image/hosting/mohw.png")
                .setColor("#FF9899")
                .setURL("http://ncov.mohw.go.kr")
                .addField('**확진 환자**', calcIncrease($, "decideCnt"))
                .addField('**격리 해제**', calcIncrease($, "clearCnt"))
                .addField('**격리 중**', calcIncrease($, "careCnt"))
                .addField('**사망자**', calcIncrease($, "deathCnt"))
                .addField('**검사 중**', calcIncrease($, "examCnt"));

            return message.channel.send(coronaEmbed);
        }
        else {
            return message.channel.send('코로나 현황을 조회할 수 없습니다.');
        }
    }
};