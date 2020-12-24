const { writeFile, exec } = require('../util/async_to_promis.js');
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

            const info = parse("tr em .blind");
            const summary1 = parse("table[summary='PER/EPS 정보'] em");
            let summary2 = parse("table[summary='투자의견 정보'] em");
            if (summary2.length == 0) {
                summary2 = parse("table[summary='시가총액 정보'] em");
            }

            const picName = `${code}_${Math.floor(Date.now() / 60000)}`;
            await writeFile(`./pictures/stock/${picName}.png`, await (await fetch(`https://ssl.pstatic.net/imgfinance/chart/mobile/candle/day/${code}_end.png`)).buffer());
            await exec(`python3 ./util/make_stock_info.py ${picName} "${parse("dl.blind strong").text()} (${code}) 일봉" ${parse("div.today > .no_today .blind").text()} ${parse("div.today > .no_exday .ico").eq(0).text()} ${parse("div.today > .no_exday .blind").eq(0).text()} ${parse("div.today > .no_exday .blind").eq(1).text()} ${info.eq(5).text()} ${info.eq(1).text()} ${summary2.eq(2).text()} ${summary2.eq(3).text()}`);
            // 파이썬 스크립트 실행

            const stockEmbed = new MessageEmbed()
                .setTitle(`${parse("dl.blind strong").text()} (${code}) 일봉`)
                .setColor("#F8AA2A")
                .setURL(`https://finance.naver.com/item/main.nhn?code=${code}`)
                .setImage(`http://140.238.26.231:8170/image/stock/${picName}.png`)
                .addField('**거래량**', parse("tr em .blind").eq(3).text() || 0, true)
                .addField('**거래대금**', `${parse("tr em .blind").eq(6).text() || 0}${parse("td .sptxt.sp_txt11").text()}원`, true)
                .addField('**시가총액**', parse("div#tab_con1 .strong td").eq(0).text().replace(/\s+/g, "").replace(/([가-힣])(\d)/g, "$1 $2"), true) // 단위 띄어쓰기 로직
                .addField('**PER(배)**', summary1.eq(0).text() || "-", true)
                .addField('**EPS(원)**', summary1.eq(1).text() || "-", true)
                .addField('**PBR(배)**', summary1.eq(4).text() || "-", true)
                .addField('**BPS(원)**', summary1.eq(5).text() || "-", true)
                .addField('**배당률(%)**', summary1.eq(6).text() || "-", true);

            return message.channel.send(stockEmbed);
        }
        else {
            return message.channel.send("검색 내용에 해당하는 주식의 정보를 조회할 수 없습니다.");
        }
    }
};