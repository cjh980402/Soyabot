const { cmd } = require('../admin/admin_function');
const { MessageEmbed } = require('../util/discord.js-extend');
const fetch = require('node-fetch');
const chartType = {
    '일봉': 'candle/day',
    '주봉': 'candle/week',
    '월봉': 'candle/month',
    '1일': 'day',
    '3개월': 'area/month3',
    '1년': 'area/year',
    '3년': 'area/year3',
    '10년': 'area/year10'
};

const redirectURL = {
    itemmain: '/item/index.nhn',
    sisesise_index: '/sise/siseIndex.nhn',
    worldsise: '/world/item.nhn'
};

function getChartImage(identifer, type, isWorld = false, isWorldItem = false) {
    return `https://ssl.pstatic.net/imgfinance/chart/mobile${isWorld ? '/world' : ''}${isWorldItem ? '/item' : ''}/${chartType[type]}/${identifer}_end.png?sidcode=${Date.now()}`;
}

function getRedirectURL(url) {
    const afterRedirect = redirectURL[url.substring(0, url.indexOf('.nhn')).replace(/\//g, '')];
    return afterRedirect ? url.replace(url.substring(0, url.indexOf('?')), afterRedirect) : url;
}

module.exports = {
    usage: `${client.prefix}주식정보 (검색 내용) (차트 종류)`,
    command: ['주식정보', 'ㅈㅅㅈㅂ'],
    description: `- 검색 내용에 해당하는 주식의 정보를 보여줍니다.
- (차트 종류): ${Object.keys(chartType).join(', ')} 입력가능 (생략 시 일봉으로 적용)`,
    type: ['기타'],
    async execute(message, args) {
        if (args.length < 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const type = args.length > 1 && chartType[args[args.length - 1]] ? args.pop() : '일봉'; // 차트 종류
        const search = args.join(' ').toLowerCase();
        const searchRslt = (await (await fetch(`https://ac.finance.naver.com/ac?q=${encodeURIComponent(search)}&t_koreng=1&st=111&r_lt=111`)).json()).items[0];

        if (!searchRslt?.length) {
            return message.channel.send('검색 내용에 해당하는 주식의 정보를 조회할 수 없습니다.');
        } else {
            const stockfind = searchRslt.find((v) => v[0][0].toLowerCase() === search || v[1][0].toLowerCase() === search) ?? searchRslt[0]; // 내용과 일치하거나 첫번째 항목
            const code = stockfind[0][0];
            const name = stockfind[1][0];
            const link = getRedirectURL(stockfind[3][0]); // 리다이렉트 로직 반영
            const identifer = stockfind[4][0];

            const stockEmbed = new MessageEmbed().setTitle(`**${name} (${code}) ${type}**`).setColor('#FF9999').setURL(`https://m.stock.naver.com${link}`);
            if (stockfind[2][0] === '국내지수') {
                // 국내 지수
                const data = await (await fetch(`https://m.stock.naver.com/api/index/${identifer}/integration`)).json();
                const nowData = await (await fetch(`https://polling.finance.naver.com/api/realtime?query=SERVICE_INDEX%3A${identifer}`)).json();
                if (nowData.result.areas[0].datas.length === 0) {
                    return message.channel.send('검색 내용에 해당하는 주식의 정보를 조회할 수 없습니다.');
                }

                const chartURL = getChartImage(identifer, type);
                const nowPrice = nowData.result.areas[0].datas[0].nv / 100;
                const changeAmount = nowData.result.areas[0].datas[0].cv / 100; // 숫자값
                const changeRate = nowData.result.areas[0].datas[0].cr;
                const isFUT = identifer === 'FUT';

                const minPrice = data.totalInfos[isFUT ? 3 : 1].value;
                const maxPrice = data.totalInfos[isFUT ? 2 : 0].value;
                const amount = data.totalInfos[isFUT ? 4 : 2].value;
                const totalPrice = data.totalInfos[isFUT ? 5 : 3].value;
                const min_52weeks = data.totalInfos[isFUT ? 7 : 5].value;
                const max_52weeks = data.totalInfos[isFUT ? 6 : 4].value;

                await cmd(
                    `python3 ./util/make_stock_info.py '${code}' ${chartURL} '${name} (${code}) ${type}' '' ${nowPrice.toLocaleString()} ${changeAmount} ${changeRate} ${minPrice} ${maxPrice} ${max_52weeks} ${min_52weeks}`
                );
                // 파이썬 스크립트 실행

                stockEmbed
                    .addField(isFUT ? '**약정수량**' : '**거래량**', amount, true)
                    .addField('**거래대금**', totalPrice, true)
                    .addField('**개인**', data.dealTrendInfo.personalValue, true)
                    .addField('**외국인**', data.dealTrendInfo.foreignValue, true)
                    .addField('**기관**', data.dealTrendInfo.institutionalValue, true);
                if (data.upDownStockInfo) {
                    stockEmbed.addField('**상승**', `${data.upDownStockInfo.riseCount} (${data.upDownStockInfo.upperCount})`, true);
                    stockEmbed.addField('**하락**', `${data.upDownStockInfo.fallCount} (${data.upDownStockInfo.lowerCount})`, true);
                }
            } else if (stockfind[2][0] === '해외지수') {
                // 해외 지수
                const data = await (await fetch(`https://api.stock.naver.com/index/${identifer}/basic`)).json();
                if (data[0] === '잘못된 지수입니다.') {
                    return message.channel.send('검색 내용에 해당하는 주식의 정보를 조회할 수 없습니다.');
                }

                const chartURL = getChartImage(identifer, type, true);
                const nowPrice = data.closePrice;
                const changeAmount = data.compareToPreviousClosePrice.replace(/,/g, '');
                const changeRate = data.fluctuationsRatio;

                const minPrice = data.stockItemTotalInfos[3].value;
                const maxPrice = data.stockItemTotalInfos[2].value;
                const min_52weeks = data.stockItemTotalInfos[5].value;
                const max_52weeks = data.stockItemTotalInfos[4].value;

                await cmd(
                    `python3 ./util/make_stock_info.py '${code}' ${chartURL} '${name} (${code}) ${type}' '' ${nowPrice.toLocaleString()} ${changeAmount} ${changeRate} ${minPrice} ${maxPrice} ${max_52weeks} ${min_52weeks}`
                );
                // 파이썬 스크립트 실행
            } else if (stockfind[3][0].startsWith('/item/main')) {
                // 국내 주식
                const data = await (await fetch(`https://m.stock.naver.com/api/stock/${identifer}/integration`)).json();
                const nowData = await (await fetch(`https://polling.finance.naver.com/api/realtime?query=SERVICE_ITEM%3A${identifer}`)).json();
                if (nowData.result.areas[0].datas.length === 0) {
                    return message.channel.send('검색 내용에 해당하는 주식의 정보를 조회할 수 없습니다.');
                }

                const chartURL = getChartImage(identifer, type);
                const beforePrice = nowData.result.areas[0].datas[0].sv;
                const nowPrice = nowData.result.areas[0].datas[0].nv;
                const changeAmount = nowPrice - beforePrice; // 숫자값
                const changeRate = (100 * (changeAmount / beforePrice)).toFixed(2);
                const isETF = data.stockEndType === 'etf';
                if (isETF && data.totalInfos.length === 18) {
                    data.totalInfos.splice(7, 3, data.totalInfos[8]);
                } else if (!isETF && data.totalInfos.length === 20) {
                    data.totalInfos.splice(9, 3, data.totalInfos[10]);
                }

                const minPrice = data.totalInfos[3].value;
                const maxPrice = data.totalInfos[2].value;
                const amount = data.totalInfos[4].value;
                const totalPrice = data.totalInfos[5].value;
                const capitalization = data.totalInfos[6].value;
                const min_52weeks = data.totalInfos[isETF ? 7 : 9].value;
                const max_52weeks = data.totalInfos[isETF ? 6 : 8].value;

                await cmd(
                    `python3 ./util/make_stock_info.py '${code}' ${chartURL} '${name} (${code}) ${type}' 원 ${nowPrice.toLocaleString()} ${changeAmount} ${changeRate} ${minPrice} ${maxPrice} ${max_52weeks} ${min_52weeks}`
                );
                // 파이썬 스크립트 실행

                stockEmbed.addField('**거래량**', amount, true).addField('**거래대금**', `${totalPrice}원`, true);
                if (isETF) {
                    stockEmbed
                        .addField('**최근 1개월 수익률**', data.totalInfos[8].value, true)
                        .addField('**최근 3개월 수익률**', data.totalInfos[9].value, true)
                        .addField('**최근 6개월 수익률**', data.totalInfos[10].value, true)
                        .addField('**최근 1년 수익률**', data.totalInfos[11].value, true)
                        .addField('**NAV**', data.totalInfos[12].value, true)
                        .addField('**펀드보수**', data.totalInfos[13].value, true);
                } else {
                    stockEmbed
                        .addField('**시가총액**', `${capitalization}원`, true)
                        .addField('**외인소진율**', data.totalInfos[7].value, true)
                        .addField('**PER**', data.totalInfos[10].value, true)
                        .addField('**EPS**', data.totalInfos[11].value, true)
                        .addField('**PBR**', data.totalInfos[14].value, true)
                        .addField('**BPS**', data.totalInfos[15].value, true)
                        .addField('**배당률**', data.totalInfos[16].value, true)
                        .addField('**배당금**', data.totalInfos[17].value, true);
                }
            } else {
                // 해외 주식
                const data = await (await fetch(`https://api.stock.naver.com/stock/${identifer}/basic`)).json();
                if (data.code === 'StockConflict') {
                    return message.channel.send('검색 내용에 해당하는 주식의 정보를 조회할 수 없습니다.');
                }

                const chartURL = getChartImage(identifer, type, true, true);
                const nowPrice = data.closePrice;
                const changeAmount = data.compareToPreviousClosePrice.replace(/,/g, ''); // 숫자값
                const changeRate = data.fluctuationsRatio;

                const minPrice = data.stockItemTotalInfos[3].value;
                const maxPrice = data.stockItemTotalInfos[2].value;
                const amount = data.stockItemTotalInfos[4].value;
                const totalPrice = data.stockItemTotalInfos[5].value;
                const capitalization = data.stockItemTotalInfos[6].value;
                const min_52weeks = data.stockItemTotalInfos[9].value;
                const max_52weeks = data.stockItemTotalInfos[8].value;

                await cmd(
                    `python3 ./util/make_stock_info.py '${code}' ${chartURL} '${name} (${code}) ${type}' ${
                        data.currencyType.name
                    } ${nowPrice.toLocaleString()} ${changeAmount} ${changeRate} ${minPrice} ${maxPrice} ${max_52weeks} ${min_52weeks}`
                );
                // 파이썬 스크립트 실행

                stockEmbed
                    .addField('**거래량**', amount, true)
                    .addField('**거래대금**', `${totalPrice}${data.currencyType.name}`, true)
                    .addField('**시가총액**', `${capitalization}${data.currencyType.name}`, true);
                if (data.stockEndType === 'etf') {
                    const etfData = await (await fetch(`https://api.stock.naver.com/etf/${identifer}/basic`)).json();
                    stockEmbed
                        .addField('**최근 1개월 수익률**', etfData.stockItemTotalInfos[8].value, true)
                        .addField('**최근 3개월 수익률**', etfData.stockItemTotalInfos[9].value, true)
                        .addField('**최근 6개월 수익률**', etfData.stockItemTotalInfos[10].value, true)
                        .addField('**최근 1년 수익률**', etfData.stockItemTotalInfos[11].value, true)
                        .addField('**NAV**', etfData.stockItemTotalInfos[7].value, true)
                        .addField('**배당금**', etfData.stockItemTotalInfos[13].value, true);
                } else {
                    stockEmbed
                        .addField('**업종**', data.stockItemTotalInfos[7].value, true)
                        .addField('**PER**', data.stockItemTotalInfos[10].value, true)
                        .addField('**EPS**', data.stockItemTotalInfos[11].value, true)
                        .addField('**PBR**', data.stockItemTotalInfos[12].value, true)
                        .addField('**BPS**', data.stockItemTotalInfos[13].value, true)
                        .addField('**배당률**', data.stockItemTotalInfos[15].value, true)
                        .addField('**배당금**', data.stockItemTotalInfos[14].value, true);
                }
            }

            stockEmbed.setImage(`http://${client.botDomain}/image/stock/${encodeURIComponent(code)}.png?time=${Date.now()}`);
            return message.channel.send({ embeds: [stockEmbed] });
        }
    }
};
