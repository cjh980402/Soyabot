const { MessageAttachment, MessageEmbed } = require('../util/discord.js-extend');
const { cmd } = require('../admin/admin_function');
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

function getTotalInfoObj(totalInfos) {
    return totalInfos.reduce((acc, cur) => ({ ...acc, [cur.key]: cur.value }), {});
}

async function getStockEmbed(search, searchRslt, type) {
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

        data.totalInfos = getTotalInfoObj(data.totalInfos);
        const minPrice = data.totalInfos['저가'];
        const maxPrice = data.totalInfos['고가'];
        const min_52weeks = data.totalInfos['52주 최저'];
        const max_52weeks = data.totalInfos['52주 최고'];

        await cmd(
            `python3 ./util/make_stock_info.py '${code}' ${chartURL} '${name} (${code}) ${type}' '' ${nowPrice.toLocaleString()} ${changeAmount} ${changeRate} ${minPrice} ${maxPrice} ${max_52weeks} ${min_52weeks}`
        );
        // 파이썬 스크립트 실행

        stockEmbed
            .addField('**거래량**', data.totalInfos['거래량'], true)
            .addField('**거래대금**', data.totalInfos['대금'], true)
            .addField('**개인**', data.dealTrendInfo.personalValue, true)
            .addField('**외국인**', data.dealTrendInfo.foreignValue, true)
            .addField('**기관**', data.dealTrendInfo.institutionalValue, true);
        if (data.upDownStockInfo) {
            stockEmbed
                .addField('**상승**', `${data.upDownStockInfo.riseCount} (${data.upDownStockInfo.upperCount})`, true)
                .addField('**하락**', `${data.upDownStockInfo.fallCount} (${data.upDownStockInfo.lowerCount})`, true);
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

        data.stockItemTotalInfos = getTotalInfoObj(data.stockItemTotalInfos);
        const minPrice = data.stockItemTotalInfos['저가'];
        const maxPrice = data.stockItemTotalInfos['고가'];
        const min_52weeks = data.stockItemTotalInfos['52주 최저'];
        const max_52weeks = data.stockItemTotalInfos['52주 최고'];

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

        data.totalInfos = getTotalInfoObj(data.totalInfos);
        const minPrice = data.totalInfos['저가'];
        const maxPrice = data.totalInfos['고가'];
        const min_52weeks = data.totalInfos['52주 최저'];
        const max_52weeks = data.totalInfos['52주 최고'];

        await cmd(
            `python3 ./util/make_stock_info.py '${code}' ${chartURL} '${name} (${code}) ${type}' 원 ${nowPrice.toLocaleString()} ${changeAmount} ${changeRate} ${minPrice} ${maxPrice} ${max_52weeks} ${min_52weeks}`
        );
        // 파이썬 스크립트 실행

        stockEmbed.addField('**거래량**', data.totalInfos['거래량'], true).addField('**거래대금**', `${data.totalInfos['대금']}원`, true);
        if (data.stockEndType === 'etf') {
            stockEmbed
                .addField('**최근 1개월 수익률**', data.totalInfos['최근 1개월 수익률'], true)
                .addField('**최근 3개월 수익률**', data.totalInfos['최근 3개월 수익률'], true)
                .addField('**최근 6개월 수익률**', data.totalInfos['최근 6개월 수익률'], true)
                .addField('**최근 1년 수익률**', data.totalInfos['최근 1년 수익률'], true)
                .addField('**NAV**', data.totalInfos['NAV'], true)
                .addField('**펀드보수**', data.totalInfos['펀드보수'], true);
        } else {
            stockEmbed
                .addField('**시가총액**', `${data.totalInfos['시총']}원`, true)
                .addField('**외인소진율**', data.totalInfos['외인소진율'], true)
                .addField('**PER**', data.totalInfos['PER'], true)
                .addField('**EPS**', data.totalInfos['EPS'], true)
                .addField('**PBR**', data.totalInfos['PBR'], true)
                .addField('**BPS**', data.totalInfos['BPS'], true)
                .addField('**배당률**', data.totalInfos['배당수익률'], true)
                .addField('**배당금**', data.totalInfos['주당배당금'], true);
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

        data.stockItemTotalInfos = getTotalInfoObj(data.stockItemTotalInfos);
        const minPrice = data.stockItemTotalInfos['저가'];
        const maxPrice = data.stockItemTotalInfos['고가'];
        const min_52weeks = data.stockItemTotalInfos['52주 최저'];
        const max_52weeks = data.stockItemTotalInfos['52주 최고'];

        await cmd(
            `python3 ./util/make_stock_info.py '${code}' ${chartURL} '${name} (${code}) ${type}' ${
                data.currencyType.name
            } ${nowPrice.toLocaleString()} ${changeAmount} ${changeRate} ${minPrice} ${maxPrice} ${max_52weeks} ${min_52weeks}`
        );
        // 파이썬 스크립트 실행

        stockEmbed
            .addField('**거래량**', data.stockItemTotalInfos['거래량'], true)
            .addField('**거래대금**', `${data.stockItemTotalInfos['대금']}${data.currencyType.name}`, true)
            .addField('**시가총액**', `${data.stockItemTotalInfos['시총']}${data.currencyType.name}`, true);
        if (data.stockEndType === 'etf') {
            const etfData = await (await fetch(`https://api.stock.naver.com/etf/${identifer}/basic`)).json();
            etfData.stockItemTotalInfos = getTotalInfoObj(etfData.stockItemTotalInfos);
            stockEmbed
                .addField('**최근 1개월 수익률**', etfData.stockItemTotalInfos['최근 1개월 수익률'], true)
                .addField('**최근 3개월 수익률**', etfData.stockItemTotalInfos['최근 3개월 수익률'], true)
                .addField('**최근 6개월 수익률**', etfData.stockItemTotalInfos['최근 6개월 수익률'], true)
                .addField('**최근 1년 수익률**', etfData.stockItemTotalInfos['최근 1년 수익률'], true)
                .addField('**NAV**', etfData.stockItemTotalInfos['NAV'], true)
                .addField('**배당금**', etfData.stockItemTotalInfos['배당금'], true);
        } else {
            stockEmbed
                .addField('**업종**', data.stockItemTotalInfos['업종'], true)
                .addField('**PER**', data.stockItemTotalInfos['PER'], true)
                .addField('**EPS**', data.stockItemTotalInfos['EPS'], true)
                .addField('**PBR**', data.stockItemTotalInfos['PBR'], true)
                .addField('**BPS**', data.stockItemTotalInfos['BPS'], true)
                .addField('**배당률**', data.stockItemTotalInfos['배당수익률'], true)
                .addField('**배당금**', data.stockItemTotalInfos['주당배당금'], true);
        }
    }

    const image = new MessageAttachment(`./pictures/stock/${encodeURIComponent(code)}.png`);
    stockEmbed.setImage(`attachment://${encodeURIComponent(code)}.png`);

    return { embeds: [stockEmbed], files: [image] };
}

module.exports = {
    usage: `${client.prefix}주식정보 (검색 내용) (차트 종류)`,
    command: ['주식정보', 'ㅈㅅㅈㅂ'],
    description: `- 검색 내용에 해당하는 주식의 정보를 보여줍니다.
- (차트 종류): ${Object.keys(chartType).join(', ')} 입력가능 (생략 시 일봉으로 적용)`,
    type: ['기타'],
    async messageExecute(message, args) {
        if (args.length < 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const type = args.length > 1 && chartType[args[args.length - 1]] ? args.pop() : '일봉'; // 차트 종류
        const search = args.join(' ').toLowerCase();
        const searchRslt = (await (await fetch(`https://ac.finance.naver.com/ac?q=${encodeURIComponent(search)}&t_koreng=1&st=111&r_lt=111`)).json()).items[0];

        if (!searchRslt?.length) {
            return message.channel.send('검색 내용에 해당하는 주식의 정보를 조회할 수 없습니다.');
        } else {
            return message.channel.send(await getStockEmbed(search, searchRslt, type));
        }
    },
    commandData: {
        name: '주식정보',
        description: '검색 내용에 해당하는 주식의 정보를 보여줍니다.',
        options: [
            {
                name: '검색_내용',
                type: 'STRING',
                description: '주식정보를 검색할 내용',
                required: true
            },
            {
                name: '차트_종류',
                type: 'STRING',
                description: '출력할 차트의 종류 (생략 시 일봉으로 적용)',
                choices: Object.keys(chartType).map((v) => ({ name: v, value: v }))
            }
        ]
    },
    async commandExecute(interaction) {
        const type = interaction.options.getString('차트_종류') ?? '일봉'; // 차트 종류
        const search = interaction.options.getString('검색_내용');
        const searchRslt = (await (await fetch(`https://ac.finance.naver.com/ac?q=${encodeURIComponent(search)}&t_koreng=1&st=111&r_lt=111`)).json()).items[0];

        if (!searchRslt?.length) {
            return interaction.followUp('검색 내용에 해당하는 주식의 정보를 조회할 수 없습니다.');
        } else {
            return interaction.followUp(await getStockEmbed(search, searchRslt, type));
        }
    }
};
