const { OPEN_API_KEY } = require('../soyabot_config.json');
const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = {
    usage: `${client.prefix}코로나`,
    command: ["코로나", "ㅋㄹㄴ"],
    description: '- 최신 기준 코로나 국내 현황을 알려줍니다.',
    type: ["기타"],
    async execute(message) {
        const today = new Date();
        const params = new URLSearchParams();
        params.append("serviceKey", OPEN_API_KEY);
        params.append("pageNo", "1");
        params.append("numOfRows", "10");
        params.append("startCreateDt", "20200310");
        params.append("endCreateDt", `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`);
        const response = await fetch(`http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19InfStateJson?${params}`);
        const parse = cheerio.load(await response.text(), { xmlMode: true });

        const coronaEmbed = new MessageEmbed()
            .setTitle(`${new Date(parse("createDt").eq(0).text()).toLocaleString()} 기준`)
            .setColor("#F8AA2A")
            .setURL("http://ncov.mohw.go.kr")
            .addField('**누적 확진자**', `${parse("decideCnt").eq(0).text()} (⬆ ${+parse("decideCnt").eq(0).text() - +parse("decideCnt").eq(1).text()})`, true)
            .addField('**검사 중**', `${parse("examCnt").eq(0).text()} (⬆ ${+parse("examCnt").eq(0).text() - +parse("examCnt").eq(1).text()})`, true)
            .addField('**격리 해제**', `${parse("clearCnt").eq(0).text()} (⬆ ${+parse("clearCnt").eq(0).text() - +parse("clearCnt").eq(1).text()})`, true)
            .addField('**사망자**', `${parse("deathCnt").eq(0).text()} (⬆ ${+parse("deathCnt").eq(0).text() - +parse("deathCnt").eq(1).text()})`, true);

        return message.channel.send(coronaEmbed);
    }
};