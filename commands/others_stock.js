const { cmd } = require('../admin/admin_function');
const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const chartType = ["일봉", "주봉", "월봉", "1일", "3개월", "1년", "3년", "10년"];

module.exports = {
    usage: `${client.prefix}주식정보 (검색 내용) (차트 종류)`,
    command: ["주식정보", "ㅈㅅㅈㅂ"],
    description: `- 검색 내용에 해당하는 주식의 정보를 보여줍니다.
- (차트 종류): ${chartType.join(", ")} 입력가능 (생략 시 일봉으로 적용)`,
    type: ["기타"],
    async execute(message, args) {
        if (args.length < 1) {
            return message.channel.send(`${this.usage}\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const type = (args.length > 1 && chartType.includes(args[args.length - 1])) ? args.pop() : "일봉"; // 차트 종류
        const search = args.join(" ").toLowerCase();
        const searchRslt = (await (await fetch(`https://ac.finance.naver.com/ac?q=${encodeURI(search)}&t_koreng=1&st=111&r_lt=111`)).json()).items[0];

        if (!searchRslt?.length) {
            return message.channel.send("검색 내용에 해당하는 주식의 정보를 조회할 수 없습니다.");
        }
        else {
            const stockfind = searchRslt.find((v) => v[1][0].toLowerCase() == search) ?? searchRslt[0]; // 내용과 일치하거나 첫번째 항목
            const code = stockfind[0][0];
            const name = stockfind[1][0];
            const identifer = stockfind[3][0].includes(stockfind[4][0]) ? stockfind[4][0] : stockfind[3][0].split("/")[4];

            const stockEmbed = new MessageEmbed()
                .setColor("#F8AA2A")
                .setURL(`https://m.stock.naver.com${stockfind[3][0]}`);
            if (stockfind[2][0] == "국내지수") { // 국내 지수
                const parse = cheerio.load(await (await fetch(`https://m.stock.naver.com/sise/siseIndex.nhn?code=${identifer}`)).text());
                const data = parse(".total_list > li > span");
                const nowData = (await (await fetch(`https://polling.finance.naver.com/api/realtime?query=SERVICE_INDEX%3A${identifer}`)).json());
                const trendData = parse(".ct_box.dmst_trend .trend_lst");

                chartType.splice(3, 1);
                const chartURL = parse(".img_area._img_area > ._lazy_img").eq(chartType.indexOf(type == "1일" ? "일봉" : type)).attr("data-src");
                const nowPrice = nowData.result.areas[0].datas[0].nv / 100; // 숫자값
                const changeAmount = nowData.result.areas[0].datas[0].cv / 100; // 숫자값
                const changeRate = nowData.result.areas[0].datas[0].cr;
                chartType.splice(3, 0, "1일");

                const minPrice = data.eq(identifer == "FUT" ? 3 : 1).text().trim() || "0";
                const maxPrice = data.eq(identifer == "FUT" ? 2 : 0).text().trim() || "0";
                const amount = data.eq(identifer == "FUT" ? 4 : 2).text().trim() || "0";
                const totalPrice = data.eq(identifer == "FUT" ? 5 : 3).text().trim();
                const min_52weeks = data.eq(identifer == "FUT" ? 7 : 5).text().trim() || "0";
                const max_52weeks = data.eq(identifer == "FUT" ? 6 : 4).text().trim() || "0";

                await cmd(`python3 ./util/make_stock_info.py ${code} ${chartURL} "${name} (${code}) ${type == "1일" ? "일봉" : type}" 원 ${nowPrice.toLocaleString()} ${changeAmount} ${changeRate} ${minPrice} ${maxPrice} ${max_52weeks} ${min_52weeks}`);
                // 파이썬 스크립트 실행

                stockEmbed.setTitle(`${name} (${code}) ${type == "1일" ? "일봉" : type}`)
                    .addField(identifer == "FUT" ? '**약정수량**' : '**거래량**', amount, true)
                    .addField('**거래대금**', `${totalPrice}원`, true)
                    .addField('**개인**', trendData.eq(0).find("span").eq(0).text(), true)
                    .addField('**외국인**', trendData.eq(0).find("span").eq(1).text(), true)
                    .addField('**기관**', trendData.eq(0).find("span").eq(2).text(), true);

                const up = trendData.eq(2).find("span").eq(0).text();
                if (up) {
                    stockEmbed.addField('**상승**', up, true)
                }
                const down = trendData.eq(2).find("span").eq(2).text();
                if (down) {
                    stockEmbed.addField('**하락**', down, true)
                }
            }
            else if (stockfind[2][0] == "해외지수") { // 해외 지수
                if (stockfind[3][0].startsWith('/world/sise')) {
                    const parse = cheerio.load(await (await fetch(`https://m.stock.naver.com/world/item.nhn?symbol=${identifer}`)).text());
                    const data = parse(".total_lst > li > span");

                    chartType.splice(3, 1);
                    const chartURL = parse(".img_area._img_area > ._lazy_img").eq(chartType.indexOf(type == "1일" ? "일봉" : type)).attr("data-src");
                    const nowPrice = parse(".price_wrp > .stock_price").text();
                    const changeRate = +parse(".price_wrp .rate").text();
                    const changeAmount = (changeRate >= 0 ? 1 : -1) * +parse(".price_wrp .gap_price > .price").text().replace(/,/g, "");
                    chartType.splice(3, 0, "1일");

                    const minPrice = data.eq(4).text().trim() || "0";
                    const maxPrice = data.eq(1).text().trim() || "0";
                    const min_52weeks = data.eq(5).text().trim() || "0";
                    const max_52weeks = data.eq(2).text().trim() || "0";

                    await cmd(`python3 ./util/make_stock_info.py ${code} ${chartURL} "${name} (${code}) ${type == "1일" ? "일봉" : type}" "" ${nowPrice.toLocaleString()} ${changeAmount} ${changeRate} ${minPrice} ${maxPrice} ${max_52weeks} ${min_52weeks}`);
                    // 파이썬 스크립트 실행

                    stockEmbed.setTitle(`${name} (${code}) ${type == "1일" ? "일봉" : type}`);
                }
                else {
                    const data = (await (await fetch(`https://api.stock.naver.com/index/${identifer}/basic`)).json());
                    const chartMapping = {
                        "일봉": "candleDay",
                        "주봉": "candleWeek",
                        "월봉": "candleMonth",
                        "1일": "day",
                        "3개월": "areaMonthThree",
                        "1년": "areaYear",
                        "3년": "areaYearThree",
                        "10년": "areaYearTen"
                    };

                    const chartURL = data.imageCharts[chartMapping[type]];
                    const nowPrice = data.closePrice;
                    const changeAmount = data.compareToPreviousClosePrice.replace(/,/g, "");
                    const changeRate = data.fluctuationsRatio;

                    const minPrice = data.stockItemTotalInfos[3].value;
                    const maxPrice = data.stockItemTotalInfos[2].value;
                    const min_52weeks = data.stockItemTotalInfos[5].value;
                    const max_52weeks = data.stockItemTotalInfos[4].value;

                    await cmd(`python3 ./util/make_stock_info.py ${code} ${chartURL} "${name} (${code}) ${type}" "" ${nowPrice.toLocaleString()} ${changeAmount} ${changeRate} ${minPrice} ${maxPrice} ${max_52weeks} ${min_52weeks}`);
                    // 파이썬 스크립트 실행

                    stockEmbed.setTitle(`${name} (${code}) ${type}`);
                }
            }
            else if (stockfind[3][0].startsWith('/item/main')) { // 국내 주식
                const parse = cheerio.load(await (await fetch(`https://m.stock.naver.com/api/html/item/getOverallInfo.nhn?code=${identifer}`)).text());
                const data = parse(".total_list > li > span");
                const nowData = (await (await fetch(`https://polling.finance.naver.com/api/realtime?query=SERVICE_ITEM%3A${identifer}`)).json());

                const chartURL = parse(".img_area._img_area > ._lazy_img").eq(chartType.indexOf(type)).attr("data-src");
                const beforePrice = nowData.result.areas[0].datas[0].pcv; // 숫자값
                const nowPrice = nowData.result.areas[0].datas[0].nv; // 숫자값
                const changeAmount = nowPrice - beforePrice; // 숫자값
                const changeRate = (changeAmount / beforePrice * 100).toFixed(2);

                const minPrice = data.eq(3).text().trim() || "0";
                const maxPrice = data.eq(2).text().trim() || "0";
                const amount = data.eq(4).text().trim() || "0";
                const totalPrice = data.eq(5).text().trim();
                const capitalization = data.eq(6).text().trim();
                const min_52weeks = data.eq(9).contents().first().text().trim() || "0";
                const max_52weeks = data.eq(8).contents().first().text().trim() || "0";

                await cmd(`python3 ./util/make_stock_info.py ${code} ${chartURL} "${name} (${code}) ${type}" 원 ${nowPrice.toLocaleString()} ${changeAmount} ${changeRate} ${minPrice} ${maxPrice} ${max_52weeks} ${min_52weeks}`);
                // 파이썬 스크립트 실행

                stockEmbed.setTitle(`${name} (${code}) ${type}`)
                    .addField('**거래량**', amount, true)
                    .addField('**거래대금**', `${totalPrice}원`, true)
                    .addField('**시가총액**', `${capitalization}원`, true)
                    .addField('**외인소진율**', data.eq(7).text().trim(), true)
                    .addField('**PER**', data.eq(10).text().trim(), true)
                    .addField('**EPS**', data.eq(11).text().trim(), true)
                    .addField('**PBR**', data.eq(14).text().trim(), true)
                    .addField('**BPS**', data.eq(15).text().trim(), true)
                    .addField('**배당률**', data.eq(16).text().trim(), true)
                    .addField('**배당금**', data.eq(17).text().trim(), true);
            }
            else { // 해외 주식
                const data = (await (await fetch(`https://api.stock.naver.com/stock/${identifer}/basic`)).json());
                const chartMapping = {
                    "일봉": "candleDay",
                    "주봉": "candleWeek",
                    "월봉": "candleMonth",
                    "1일": "day",
                    "3개월": "areaMonthThree",
                    "1년": "areaYear",
                    "3년": "areaYearThree",
                    "10년": "areaYearTen"
                };

                const chartURL = data.imageCharts[chartMapping[type]];
                const nowPrice = data.closePrice;
                const changeAmount = data.compareToPreviousClosePrice.replace(/,/g, "");;
                const changeRate = data.fluctuationsRatio;

                const minPrice = data.stockItemTotalInfos[3].value;
                const maxPrice = data.stockItemTotalInfos[2].value;
                const amount = data.stockItemTotalInfos[4].value;
                const totalPrice = data.stockItemTotalInfos[5].value;
                const capitalization = data.stockItemTotalInfos[6].value;
                const min_52weeks = data.stockItemTotalInfos[9].value;
                const max_52weeks = data.stockItemTotalInfos[8].value;

                await cmd(`python3 ./util/make_stock_info.py ${code} ${chartURL} "${name} (${code}) ${type}" ${data.currencyType.name} ${nowPrice.toLocaleString()} ${changeAmount} ${changeRate} ${minPrice} ${maxPrice} ${max_52weeks} ${min_52weeks}`);
                // 파이썬 스크립트 실행

                stockEmbed.setTitle(`${name} (${code}) ${type}`)
                    .addField('**거래량**', amount, true)
                    .addField('**거래대금**', `${totalPrice}${data.currencyType.name}`, true)
                    .addField('**시가총액**', `${capitalization}${data.currencyType.name}`, true)
                    .addField('**업종**', data.stockItemTotalInfos[7].value, true)
                    .addField('**PER**', data.stockItemTotalInfos[10].value, true)
                    .addField('**EPS**', data.stockItemTotalInfos[11].value, true)
                    .addField('**PBR**', data.stockItemTotalInfos[12].value, true)
                    .addField('**BPS**', data.stockItemTotalInfos[13].value, true)
                    .addField('**배당률**', data.stockItemTotalInfos[15].value, true)
                    .addField('**배당금**', data.stockItemTotalInfos[14].value, true);
            }

            stockEmbed.setImage(`http://140.238.26.231:8170/image/stock/${code}.png?time=${Date.now()}`);
            return message.channel.send(stockEmbed);
        }
    }
};