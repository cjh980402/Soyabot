const { cmd } = require('../admin/admin_function');
const { MessageEmbed } = require('../util/discord.js-extend');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
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

module.exports = {
    usage: `${client.prefix}코인정보 (검색 내용) (차트 종류)`,
    command: ['코인정보', 'ㅋㅇㅈㅂ'],
    description: `- 검색 내용에 해당하는 코인의 정보를 보여줍니다.
- (차트 종류): ${Object.keys(chartType).join(', ')} 입력가능 (생략 시 1일로 적용)`,
    type: ['기타'],
    async execute(message, args) {
        if (args.length < 1) {
            return message.channel.send(`${this.usage}\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const type = args.length > 1 && chartType[args[args.length - 1]] ? args.pop() : '1일'; // 차트 종류
        const search = args.join(' ').toLowerCase();
        const coinLink = `https://search.daum.net/search?w=tot&DA=EMA&q=${encodeURIComponent(search)}&rtmaxcoll=EMA`;
        const searchRslt = cheerio.load(await (await fetch(coinLink)).text())('div[disp-attr="EMA"]');

        if (!searchRslt.length) {
            return message.channel.send('검색 내용에 해당하는 코인의 정보를 조회할 수 없습니다.');
        } else {
            const name = searchRslt.find('.tit_currency').text();
            const code = searchRslt.find('.tit_sub').text();

            const chartURL = getChartImage(code, type);
            const nowPrice = searchRslt.find('.currency_value').contents().first().text();
            const currencyType = searchRslt.find('.currency_value .screen_out').text();
            const changeType = searchRslt.find('.ico_rwdt.ico_stock').text(); // 상승, 보합, 하락
            const changeString = searchRslt.find('.rate_value').text();

            const todayData = searchRslt.find('.list_stock dd');
            const minPrice = todayData.eq(1).text();
            const maxPrice = todayData.eq(0).text();
            const amount = todayData.eq(2).text();

            await cmd(`python3 ./util/make_coin_info.py "${code}" ${chartURL} "${name} (${code}) ${type}" ${currencyType} ${nowPrice} ${changeType} "${changeString}" ${minPrice} ${maxPrice}`);
            // 파이썬 스크립트 실행

            const coinEmbed = new MessageEmbed().setTitle(`**${name} (${code}) ${type}**`).setColor('#FF9899').setURL(coinLink).setImage(`http://140.238.26.231:8170/image/coin/${code}.png?time=${Date.now()}`).addField('**거래대금**', `${amount}${currencyType}`, true);

            return message.channel.send(coinEmbed);
        }
    }
};
