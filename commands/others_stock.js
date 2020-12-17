const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = {
    usage: `${client.prefix}주식정보 (검색 내용)`,
    command: ["주식정보", "ㅈㅅㅈㅂ"],
    description: "- 검색 내용에 해당하는 주식의 정보를 보여줍니다.",
    type: ["기타"],
    async execute(message, args) {
        if (args.length < 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const search = escape(iconv.encode(args.join(" "), "euc-kr").toString("binary")); // euc-kr의 encodeURI
        let parse = cheerio.load(iconv.decode(await (await fetch(`https://finance.naver.com/search/searchList.nhn?query=${search}`)).buffer(), "euc-kr"));
        const stockdata = parse("td.tit > a");
        if (stockdata.length > 0) {
            const stockfind = stockdata.filter((i, v) => parse(v).text() == args.join(" "));
            const code = /\d+/.exec((stockfind.length > 0 ? stockfind : stockdata).eq(0).attr("href")); // 내용과 일치하거나 첫번째 항목
            parse = cheerio.load(iconv.decode(await (await fetch(`https://finance.naver.com/item/main.nhn?code=${code}`)).buffer(), "euc-kr"));

            let cmpPrice = "";
            if (parse("div.today > .no_exday .no_down > .ico").eq(0).text() != "하락") {
                cmpPrice = `⬆️ ${parse("div.today > .no_exday .blind").eq(0).text()}원 (+${parse("div.today > .no_exday .blind").eq(1).text()}%)`;
            }
            else {
                cmpPrice = `⬇️ ${parse("div.today > .no_exday .blind").eq(0).text()}원 (-${parse("div.today > .no_exday .blind").eq(1).text()}%)`;
            }
            const summary = parse("table[summary='PER/EPS 정보'] em");

            const stockEmbed = new MessageEmbed()
                .setTitle(`${parse("dl.blind strong").text()} (${code}) 일봉`)
                .setColor("#F8AA2A")
                .setURL(`https://finance.naver.com/item/main.nhn?code=${code}`)
                .setImage(`https://ssl.pstatic.net/imgfinance/chart/mobile/candle/day/${code}_end.png`)
                .addField('**현재시가**', `${parse("div.today > .no_today .blind").text()}원`, true)
                .addField('**전일대비**', cmpPrice, true)
                .addField('**거래량**', parse("tr em .blind").eq(3).text() || 0, true)
                .addField('**거래대금**', `${parse("tr em .blind").eq(6).text() || 0}${parse("td .sptxt.sp_txt11").text()}원`, true)
                .addField('**시가총액**', parse("div#tab_con1 .strong td").eq(0).text().replace(/\s+/g, "").replace(/[가-힣]\d/g, s => `${s[0]} ${s[1]}`), true) // 단위 띄어쓰기 로직
                .addField('**PER(배)**', summary.eq(0).text() || "-", true)
                .addField('**EPS(원)**', summary.eq(1).text() || "-", true)
                .addField('**PBR(배)**', summary.eq(4).text() || "-", true)
                .addField('**BPS(원)**', summary.eq(5).text() || "-", true)
                .addField('**배당률(%)**', summary.eq(6).text() || "-", true);

            return message.channel.send(stockEmbed);
        }
        else {
            return message.channel.send("검색 내용에 해당하는 주식의 정보를 조회할 수 없습니다.");
        }
    }
};