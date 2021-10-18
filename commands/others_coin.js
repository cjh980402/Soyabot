import fetch from 'node-fetch';
import { cmd } from '../admin/admin_function.js';
import { MessageAttachment, MessageEmbed } from '../util/discord.js-extend.js';
const chartType = {
    '1일': 'd',
    '1주': 'w',
    '1개월': 'm',
    '3개월': 'm3',
    '1년': 'y'
};

function getChartImage(code, type) {
    return `https://imagechart.upbit.com/${chartType[type]}/${code}.png`;
}

async function getCoinBinancePrice(code) {
    const binance = await (await fetch('https://api.binance.com/api/v1/ticker/allPrices')).json();
    const coinName = `${code}USDT`;
    for (const coin of binance) {
        if (coinName === coin.symbol) {
            return +coin.price;
        }
    }
    return -1; // 바이낸스 미상장인 경우
}

async function usdToKRW(usd) {
    const usdData = await (await fetch('https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD')).json();
    return usd * usdData[0].basePrice;
}

async function getCoinEmbed(searchRslt, type) {
    const name = searchRslt.korean_name;
    const code = searchRslt.market.split('-')[1];

    const todayData = (await (await fetch(`https://api.upbit.com/v1/ticker?markets=${searchRslt.market}`)).json())[0];
    const chartURL = getChartImage(code, type);
    const nowPrice = todayData.trade_price.toLocaleString();
    const changeType = todayData.change; // RISE, EVEN, FALL
    const changeString = `${todayData.change_price.toLocaleString()} (${(100 * todayData.signed_change_rate).toFixed(2)}%)`;

    const minPrice = todayData.low_price.toLocaleString();
    const maxPrice = todayData.high_price.toLocaleString();
    const amount = todayData.acc_trade_price_24h.toLocaleUnitString('ko-KR', 2);

    const { stdout: coinPic } = await cmd(`python3 ./util/make_coin_info.py ${chartURL} '${name} (${code}) ${type}' 원 ${nowPrice} ${changeType} '${changeString}' ${minPrice} ${maxPrice}`, {
        encoding: 'buffer'
    });
    // 파이썬 스크립트 실행

    const image = new MessageAttachment(coinPic, `${code}.png`);
    const coinEmbed = new MessageEmbed()
        .setTitle(`**${name} (${code}) ${type}**`)
        .setColor('#FF9999')
        .setURL(`https://upbit.com/exchange?code=CRIX.UPBIT.KRW-${code}&tab=chart`)
        .setImage(`attachment://${code}.png`)
        .addField('**거래대금**', `${amount}원`, true);

    const binancePrice = await getCoinBinancePrice(code);
    if (binancePrice !== -1) {
        const binanceKRW = await usdToKRW(binancePrice);
        const kimPre = todayData.trade_price - binanceKRW;
        const kimPrePercent = 100 * (kimPre / binanceKRW);
        coinEmbed
            .addField('**바이낸스**', `${binancePrice.toLocaleString()}$\n${binanceKRW.toLocaleString()}원`, true)
            .addField('**김프**', ` ${kimPre.toLocaleString()}원 (${kimPrePercent.toFixed(2)}%)`, true);
    }

    return { embeds: [coinEmbed], files: [image] };
}

export const usage = `${client.prefix}코인정보 (검색 내용) (차트 종류)`;
export const command = ['코인정보', 'ㅋㅇㅈㅂ'];
export const description = `- 검색 내용에 해당하는 코인의 정보를 보여줍니다.
- (차트 종류): ${Object.keys(chartType).join(', ')} 입력가능 (생략 시 1일로 적용)`;
export const type = ['기타'];
export async function messageExecute(message, args) {
    if (args.length < 1) {
        return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
    }

    const type = args.length > 1 && chartType[args[args.length - 1]] ? args.pop() : '1일'; // 차트 종류
    const krSearch = args.join('');
    const enSearch = args.join(' ').toUpperCase();
    const searchList = await (await fetch('https://api.upbit.com/v1/market/all')).json();
    const searchRslt = searchList.find((v) => {
        const [currency, code] = v.market.split('-');
        return currency === 'KRW' && (code.includes(enSearch) || v.korean_name.includes(krSearch) || v.english_name.toUpperCase().includes(enSearch));
    });

    if (!searchRslt) {
        return message.channel.send('검색 내용에 해당하는 코인의 정보를 조회할 수 없습니다.');
    } else {
        return message.channel.send(await getCoinEmbed(searchRslt, type));
    }
}
export const commandData = {
    name: '코인정보',
    description: '검색 내용에 해당하는 코인의 정보를 보여줍니다.',
    options: [
        {
            name: '검색_내용',
            type: 'STRING',
            description: '코인정보를 검색할 내용',
            required: true
        },
        {
            name: '차트_종류',
            type: 'STRING',
            description: '출력할 차트의 종류 (생략 시 1일로 적용)',
            choices: Object.keys(chartType).map((v) => ({ name: v, value: v }))
        }
    ]
};
export async function commandExecute(interaction) {
    const type = interaction.options.getString('차트_종류') ?? '1일'; // 차트 종류
    const search = interaction.options.getString('검색_내용');
    const krSearch = search.replace(/\s+/g, '');
    const enSearch = search.toUpperCase();
    const searchList = await (await fetch('https://api.upbit.com/v1/market/all')).json();
    const searchRslt = searchList.find((v) => {
        const [currency, code] = v.market.split('-');
        return currency === 'KRW' && (code.includes(enSearch) || v.korean_name.includes(krSearch) || v.english_name.toUpperCase().includes(enSearch));
    });

    if (!searchRslt) {
        return interaction.followUp('검색 내용에 해당하는 코인의 정보를 조회할 수 없습니다.');
    } else {
        return interaction.followUp(await getCoinEmbed(searchRslt, type));
    }
}
