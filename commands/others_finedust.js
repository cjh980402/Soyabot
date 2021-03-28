const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = {
    usage: `${client.prefix}미세먼지`,
    command: ["미세먼지", "ㅁㅅㅁㅈ", "초미세먼지", "ㅊㅁㅅㅁㅈ"],
    description: '- 현재 한국의 미세먼지(초미세먼지) 현황을 보여줍니다.',
    type: ["기타"],
    async execute(message) {
        const isNotUltra = !/초미세먼지|ㅊㅁㅅㅁㅈ/.test(message.content); // 미세먼지인 경우 true
        const $ = cheerio.load(await (await fetch("https://m.search.daum.net/search?w=tot&nil_mtopsearch=btn&DA=YZR&q=%EB%AF%B8%EC%84%B8%EB%A8%BC%EC%A7%80")).text());

        const imgLink = decodeURIComponent($("img[class='img_live']").eq(+isNotUltra).attr("data-original-src").split("fname=")[1]);
        const dustTitle = `현재 ${isNotUltra ? "" : "초"}미세먼지 지도`

        return message.channel.send(dustTitle, {
            files: [imgLink]
        });
    }
};