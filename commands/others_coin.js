import { AttachmentBuilder, EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import { request, Agent } from 'undici';
import crypto from 'crypto';
import { KOREAEXIM_API_KEY } from '../soyabot_config.js';
import { exec } from '../admin/admin_function.js';
import { Util } from '../util/Util.js';
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
    const { body } = await request('https://api.binance.com/api/v1/ticker/allPrices');
    const binance = await body.json();
    const coinName = `${code}USDT`;
    for (const coin of binance) {
        if (coinName === coin.symbol) {
            return +coin.price;
        }
    }
    return -1; // 바이낸스 미상장인 경우
}

async function usdToKRW(usd) {
    let ttb = 0;
    for (let i = 0; i < 10 && ttb === 0; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const searchDate = date.toISOString().slice(0, 10).replace(/-/g, '');
        const { body } = await request(
            `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${KOREAEXIM_API_KEY}&searchdate=${searchDate}&data=AP01`,
            {
                dispatcher: new Agent({
                    connect: {
                        rejectUnauthorized: false,
                        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT
                    }
                })
            }
        );
        const exchangeData = await body.json();
        ttb = +(exchangeData.find((v) => v.result === 1 && v.cur_unit === 'USD')?.ttb.replace(/,/g, '') ?? 0);
    }
    return usd * ttb;
}

async function getCoinEmbed(searchRslt, type) {
    const name = searchRslt.korean_name;
    const code = searchRslt.market.split('-')[1];

    const { body } = await request(`https://api.upbit.com/v1/ticker?markets=${searchRslt.market}`);
    const todayData = (await body.json())[0];
    const chartURL = getChartImage(code, type);
    const nowPrice = todayData.trade_price.toLocaleString();
    const changeType = todayData.change; // RISE, EVEN, FALL
    const changeString = `${todayData.change_price.toLocaleString()} (${(100 * todayData.signed_change_rate).toFixed(
        2
    )}%)`;

    const minPrice = todayData.low_price.toLocaleString();
    const maxPrice = todayData.high_price.toLocaleString();
    const amount = Util.toUnitString(todayData.acc_trade_price_24h, 2);

    const { stdout: coinPic } = await exec(
        `python3 ./util/python/make_coin_info.py ${chartURL} '${name} (${code}) ${type}' 원 ${nowPrice} ${changeType} '${changeString}' ${minPrice} ${maxPrice}`,
        { encoding: 'buffer' }
    );
    // 파이썬 스크립트 실행

    const image = new AttachmentBuilder(coinPic, { name: `${code}.png` });
    const coinEmbed = new EmbedBuilder()
        .setTitle(`**${name} (${code}) ${type}**`)
        .setColor('#FF9999')
        .setURL(`https://upbit.com/exchange?code=CRIX.UPBIT.KRW-${code}&tab=chart`)
        .setImage(`attachment://${code}.png`)
        .addFields([{ name: '**거래대금**', value: `${amount}원`, inline: true }]);

    const binancePrice = await getCoinBinancePrice(code);
    if (binancePrice !== -1) {
        const binanceKRW = await usdToKRW(binancePrice);
        const kimPre = todayData.trade_price - binanceKRW;
        const kimPrePercent = 100 * (kimPre / binanceKRW);
        coinEmbed.addFields([
            {
                name: '**바이낸스**',
                value: `${binancePrice.toLocaleString()}$\n${binanceKRW.toLocaleString()}원`,
                inline: true
            },
            { name: '**김프**', value: `${kimPre.toLocaleString()}원 (${kimPrePercent.toFixed(2)}%)`, inline: true }
        ]);
    }

    return { embeds: [coinEmbed], files: [image] };
}

export const type = '기타';
export const commandData = {
    name: '코인정보',
    description: '검색 내용에 해당하는 코인의 정보를 보여줍니다.',
    options: [
        {
            name: '검색_내용',
            type: ApplicationCommandOptionType.String,
            description: '코인정보를 검색할 내용',
            required: true
        },
        {
            name: '차트_종류',
            type: ApplicationCommandOptionType.String,
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
    const { body } = await request('https://api.upbit.com/v1/market/all');
    const searchList = await body.json();
    const searchRslt = searchList.find((v) => {
        const [currency, code] = v.market.split('-');
        return (
            currency === 'KRW' &&
            (code.includes(enSearch) ||
                v.korean_name.includes(krSearch) ||
                v.english_name.toUpperCase().includes(enSearch))
        );
    });

    if (!searchRslt) {
        await interaction.followUp('검색 내용에 해당하는 코인의 정보를 조회할 수 없습니다.');
    } else {
        await interaction.followUp(await getCoinEmbed(searchRslt, type));
    }
}
