const { OPEN_API_KEY } = require('../soyabot_config.json');
const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');
const cheerio = require('cheerio');

function calcIncrease(parse, selector) {
    const today = +parse(selector).eq(0).text();
    const dateList = parse("stateDt");
    const yesterday = +parse(selector).filter((i) => dateList.eq(i).text() != dateList.eq(0).text()).eq(0).text();
    return `${today.toLocaleString()} (${today >= yesterday ? `⬆️ ${(today - yesterday).toLocaleString()}` : `⬇️ ${(yesterday - today).toLocaleString()}`})`;
}

module.exports = {
    usage: `${client.prefix}코로나`,
    command: ["코로나", "ㅋㄹㄴ"],
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
        const parse = cheerio.load(await (await fetch(`http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19InfStateJson?${params}`)).text(), { xmlMode: true });

        if (parse("resultCode").text() == "00") {
            const coronaEmbed = new MessageEmbed()
                .setTitle(`${new Date(parse("createDt").eq(0).text()).toLocaleString()} 기준`)
                .setThumbnail("https://blogfiles.pstatic.net/MjAyMDEyMTNfMjYw/MDAxNjA3ODQwNTQwMDk4.aIk-UJFp5fjJFxullMfCfHdNGkAUtudaJEsHfMb7l24g.nQ33ZBQ0ZQ2r70XwsU-XfjBdNmIgx_XppPxRD9rc8XMg.PNG.9804cjh/1607840508787.png")
                .setColor("#F8AA2A")
                .setURL("http://ncov.mohw.go.kr")
                .addField('**확진 환자**', calcIncrease(parse, "decideCnt"))
                .addField('**검사 중**', calcIncrease(parse, "examCnt"))
                .addField('**격리 해제**', calcIncrease(parse, "clearCnt"))
                .addField('**격리 중**', calcIncrease(parse, "careCnt"))
                .addField('**사망자**', calcIncrease(parse, "deathCnt"));

            return message.channel.send(coronaEmbed);
        }
        else {
            return message.channel.send('코로나 현황을 조회할 수 없습니다.');
        }
    }
};