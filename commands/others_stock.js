import { AttachmentBuilder, EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import { request } from 'undici';
import { exec } from '../admin/admin_function.js';
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
    return `https://ssl.pstatic.net/imgfinance/chart/mobile${isWorld ? '/world' : ''}${isWorldItem ? '/item' : ''}/${
        chartType[type]
    }/${identifer}_end.png?sidcode=${Date.now()}`;
}

function getRedirectURL(url) {
    const afterRedirect = redirectURL[url.slice(0, url.indexOf('.nhn')).replace(/\//g, '')];
    return afterRedirect ? url.replace(url.slice(0, url.indexOf('?')), afterRedirect) : url;
}

function getTotalInfoObj(totalInfos) {
    return totalInfos.reduce((acc, cur) => ({ ...acc, [cur.key]: cur.value }), {});
}

async function getStockEmbed(search, searchRslt, type) {
    const stockfind =
        searchRslt.find((v) => v[0][0].toLowerCase() === search || v[1][0].toLowerCase() === search) ?? searchRslt[0]; // 내용과 일치하거나 첫번째 항목
    const code = stockfind[0][0];
    const name = stockfind[1][0];
    const link = getRedirectURL(stockfind[3][0]); // 리다이렉트 로직 반영
    const identifer = stockfind[4][0];
    let image = null;

    const stockEmbed = new EmbedBuilder()
        .setTitle(`**${name} (${code}) ${type}**`)
        .setColor('#FF9999')
        .setURL(`https://m.stock.naver.com${link}`);
    if (stockfind[2][0] === '국내지수') {
        // 국내 지수
        const { body } = await request(`https://m.stock.naver.com/api/index/${identifer}/integration`);
        const data = await body.json();
        const { body: nowBody } = await request(
            `https://polling.finance.naver.com/api/realtime?query=SERVICE_INDEX%3A${identifer}`
        );
        const nowData = await nowBody.json();
        if (nowData.result.areas[0].datas.length === 0) {
            return '검색 내용에 해당하는 주식의 정보를 조회할 수 없습니다.';
        }

        const chartURL = getChartImage(identifer, type);
        const nowPrice = nowData.result.areas[0].datas[0].nv / 100;
        const changeAmount = nowData.result.areas[0].datas[0].cv / 100;
        const changeRate = nowData.result.areas[0].datas[0].cr;

        data.totalInfos = getTotalInfoObj(data.totalInfos);
        const minPrice = data.totalInfos['저가'];
        const maxPrice = data.totalInfos['고가'];
        const min_52weeks = data.totalInfos['52주 최저'];
        const max_52weeks = data.totalInfos['52주 최고'];

        const { stdout: stockPic } = await exec(
            `python3 ./util/python/make_stock_info.py ${chartURL} '${name} (${code}) ${type}' '' ${nowPrice.toLocaleString()} ${changeAmount} ${changeRate} ${minPrice} ${maxPrice} ${max_52weeks} ${min_52weeks}`,
            { encoding: 'buffer' }
        );
        // 파이썬 스크립트 실행
        image = new AttachmentBuilder(stockPic, { name: `${code}.png` });

        stockEmbed.addFields([
            { name: '**거래량**', value: data.totalInfos['거래량'], inline: true },
            { name: '**거래대금**', value: data.totalInfos['대금'], inline: true },
            { name: '**개인**', value: data.dealTrendInfo.personalValue, inline: true },
            { name: '**외국인**', value: data.dealTrendInfo.foreignValue, inline: true },
            { name: '**기관**', value: data.dealTrendInfo.institutionalValue, inline: true }
        ]);
        if (data.upDownStockInfo) {
            stockEmbed.addFields([
                {
                    name: '**상승**',
                    value: `${data.upDownStockInfo.riseCount} (${data.upDownStockInfo.upperCount})`,
                    inline: true
                },
                {
                    name: '**하락**',
                    value: `${data.upDownStockInfo.fallCount} (${data.upDownStockInfo.lowerCount})`,
                    inline: true
                }
            ]);
        }
    } else if (stockfind[2][0] === '해외지수') {
        // 해외 지수
        const { body } = await request(`https://api.stock.naver.com/index/${identifer}/basic`);
        const data = await body.json();
        if (data[0] === '잘못된 지수입니다.') {
            return '검색 내용에 해당하는 주식의 정보를 조회할 수 없습니다.';
        }

        const chartURL = getChartImage(identifer, type, true);
        const nowPrice = data.closePrice;
        const changeAmount = data.compareToPreviousClosePrice.replace(/,/g, '');
        const changeRate = data.fluctuationsRatio.replace(/,/g, '');

        data.stockItemTotalInfos = getTotalInfoObj(data.stockItemTotalInfos);
        const minPrice = data.stockItemTotalInfos['저가'];
        const maxPrice = data.stockItemTotalInfos['고가'];
        const min_52weeks = data.stockItemTotalInfos['52주 최저'];
        const max_52weeks = data.stockItemTotalInfos['52주 최고'];

        const { stdout: stockPic } = await exec(
            `python3 ./util/python/make_stock_info.py ${chartURL} '${name} (${code}) ${type}' '' ${nowPrice.toLocaleString()} ${changeAmount} ${changeRate} ${minPrice} ${maxPrice} ${max_52weeks} ${min_52weeks}`,
            { encoding: 'buffer' }
        );
        // 파이썬 스크립트 실행
        image = new AttachmentBuilder(stockPic, { name: `${code}.png` });
    } else if (stockfind[2][0] === '코스피' || stockfind[2][0] === '코스닥' || stockfind[2][0] === '코넥스') {
        // 국내 주식
        const { body } = await request(`https://m.stock.naver.com/api/stock/${identifer}/integration`);
        const data = await body.json();
        const { body: nowBody } = await request(
            `https://polling.finance.naver.com/api/realtime?query=SERVICE_ITEM%3A${identifer}`
        );
        const nowData = await nowBody.json();
        if (nowData.result.areas[0].datas.length === 0) {
            return '검색 내용에 해당하는 주식의 정보를 조회할 수 없습니다.';
        }

        const chartURL = getChartImage(identifer, type);
        const nowPrice = nowData.result.areas[0].datas[0].nv;
        const isFall = nowData.result.areas[0].datas[0].rf === '4' || nowData.result.areas[0].datas[0].rf === '5';
        const changeAmount = (isFall ? -1 : 1) * nowData.result.areas[0].datas[0].cv;
        const changeRate = (isFall ? -1 : 1) * nowData.result.areas[0].datas[0].cr;

        data.totalInfos = getTotalInfoObj(data.totalInfos);
        const minPrice = data.totalInfos['저가'];
        const maxPrice = data.totalInfos['고가'];
        const min_52weeks = data.totalInfos['52주 최저'];
        const max_52weeks = data.totalInfos['52주 최고'];

        const { stdout: stockPic } = await exec(
            `python3 ./util/python/make_stock_info.py ${chartURL} '${name} (${code}) ${type}' 원 ${nowPrice.toLocaleString()} ${changeAmount} ${changeRate} ${minPrice} ${maxPrice} ${max_52weeks} ${min_52weeks}`,
            { encoding: 'buffer' }
        );
        // 파이썬 스크립트 실행
        image = new AttachmentBuilder(stockPic, { name: `${code}.png` });

        stockEmbed.addFields([
            { name: '**거래량**', value: data.totalInfos['거래량'], inline: true },
            { name: '**거래대금**', value: `${data.totalInfos['대금']}원`, inline: true }
        ]);
        if (data.stockEndType === 'etf') {
            stockEmbed.addFields([
                { name: '**최근 1개월 수익률**', value: data.totalInfos['최근 1개월 수익률'], inline: true },
                { name: '**최근 3개월 수익률**', value: data.totalInfos['최근 3개월 수익률'], inline: true },
                { name: '**최근 6개월 수익률**', value: data.totalInfos['최근 6개월 수익률'], inline: true },
                { name: '**최근 1년 수익률**', value: data.totalInfos['최근 1년 수익률'], inline: true },
                { name: '**NAV**', value: data.totalInfos['NAV'], inline: true },
                { name: '**펀드보수**', value: data.totalInfos['펀드보수'], inline: true }
            ]);
        } else {
            stockEmbed.addFields([
                { name: '**시가총액**', value: `${data.totalInfos['시총']}원`, inline: true },
                { name: '**외인소진율**', value: data.totalInfos['외인소진율'], inline: true },
                { name: '**PER**', value: data.totalInfos['PER'], inline: true },
                { name: '**EPS**', value: data.totalInfos['EPS'], inline: true },
                { name: '**PBR**', value: data.totalInfos['PBR'], inline: true },
                { name: '**BPS**', value: data.totalInfos['BPS'], inline: true },
                { name: '**배당률**', value: data.totalInfos['배당수익률'], inline: true },
                { name: '**배당금**', value: data.totalInfos['주당배당금'], inline: true }
            ]);
        }
    } else {
        // 해외 주식
        const { body } = await request(`https://api.stock.naver.com/stock/${identifer}/basic`);
        const data = await body.json();
        if (data.code === 'StockConflict') {
            return '검색 내용에 해당하는 주식의 정보를 조회할 수 없습니다.';
        }

        const chartURL = getChartImage(identifer, type, true, true);
        const nowPrice = data.closePrice;
        const changeAmount = data.compareToPreviousClosePrice.replace(/,/g, '');
        const changeRate = data.fluctuationsRatio.replace(/,/g, '');

        data.stockItemTotalInfos = getTotalInfoObj(data.stockItemTotalInfos);
        const minPrice = data.stockItemTotalInfos['저가'];
        const maxPrice = data.stockItemTotalInfos['고가'];
        const min_52weeks = data.stockItemTotalInfos['52주 최저'];
        const max_52weeks = data.stockItemTotalInfos['52주 최고'];

        const { stdout: stockPic } = await exec(
            `python3 ./util/python/make_stock_info.py ${chartURL} '${name} (${code}) ${type}' ${
                data.currencyType.name
            } ${nowPrice.toLocaleString()} ${changeAmount} ${changeRate} ${minPrice} ${maxPrice} ${max_52weeks} ${min_52weeks}`,
            { encoding: 'buffer' }
        );
        // 파이썬 스크립트 실행
        image = new AttachmentBuilder(stockPic, { name: `${code}.png` });

        stockEmbed.addFields([
            { name: '**거래량**', value: data.stockItemTotalInfos['거래량'], inline: true },
            {
                name: '**거래대금**',
                value: `${data.stockItemTotalInfos['대금']}${data.currencyType.name}`,
                inline: true
            },
            {
                name: '**시가총액**',
                value: `${data.stockItemTotalInfos['시총']}${data.currencyType.name}`,
                inline: true
            }
        ]);
        if (data.stockEndType === 'etf') {
            const { body: etfBody } = await request(`https://api.stock.naver.com/etf/${identifer}/basic`);
            const etfData = await etfBody.json();
            etfData.stockItemTotalInfos = getTotalInfoObj(etfData.stockItemTotalInfos);
            stockEmbed.addFields([
                {
                    name: '**최근 1개월 수익률**',
                    value: etfData.stockItemTotalInfos['최근 1개월 수익률'],
                    inline: true
                },
                {
                    name: '**최근 3개월 수익률**',
                    value: etfData.stockItemTotalInfos['최근 3개월 수익률'],
                    inline: true
                },
                {
                    name: '**최근 6개월 수익률**',
                    value: etfData.stockItemTotalInfos['최근 6개월 수익률'],
                    inline: true
                },
                { name: '**최근 1년 수익률**', value: etfData.stockItemTotalInfos['최근 1년 수익률'], inline: true },
                { name: '**NAV**', value: etfData.stockItemTotalInfos['NAV'], inline: true },
                { name: '**배당금**', value: etfData.stockItemTotalInfos['배당금'], inline: true }
            ]);
        } else {
            stockEmbed.addFields([
                { name: '**업종**', value: data.stockItemTotalInfos['업종'], inline: true },
                { name: '**PER**', value: data.stockItemTotalInfos['PER'], inline: true },
                { name: '**EPS**', value: data.stockItemTotalInfos['EPS'], inline: true },
                { name: '**PBR**', value: data.stockItemTotalInfos['PBR'], inline: true },
                { name: '**BPS**', value: data.stockItemTotalInfos['BPS'], inline: true },
                { name: '**배당률**', value: data.stockItemTotalInfos['배당수익률'], inline: true },
                { name: '**배당금**', value: data.stockItemTotalInfos['주당배당금'], inline: true }
            ]);
        }
    }

    stockEmbed.setImage(`attachment://${code.replace(/ /g, '_')}.png`);

    return { embeds: [stockEmbed], files: [image] };
}

export const type = '기타';
export const commandData = {
    name: '주식정보',
    description: '검색 내용에 해당하는 주식의 정보를 보여줍니다.',
    options: [
        {
            name: '검색_내용',
            type: ApplicationCommandOptionType.String,
            description: '주식정보를 검색할 내용',
            required: true
        },
        {
            name: '차트_종류',
            type: ApplicationCommandOptionType.String,
            description: '출력할 차트의 종류 (생략 시 일봉으로 적용)',
            choices: Object.keys(chartType).map((v) => ({ name: v, value: v }))
        }
    ]
};
export async function commandExecute(interaction) {
    const type = interaction.options.getString('차트_종류') ?? '일봉'; // 차트 종류
    const search = interaction.options.getString('검색_내용');
    const { body } = await request(
        `https://ac.finance.naver.com/ac?q=${encodeURIComponent(search)}&t_koreng=1&st=111&r_lt=111`
    );
    const searchRslt = (await body.json()).items[0];

    if (!searchRslt?.length) {
        await interaction.followUp('검색 내용에 해당하는 주식의 정보를 조회할 수 없습니다.');
    } else {
        await interaction.followUp(await getStockEmbed(search, searchRslt, type));
    }
}
