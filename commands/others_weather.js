const { MessageEmbed } = require('../util/discord.js-extend');
const fetch = require('node-fetch');
const { load } = require('cheerio');

function generateWeatherEmbed(local, weatherDesc) {
    const embeds = [];
    for (let i = 0; i < weatherDesc.length; i++) {
        const embed = new MessageEmbed().setTitle(`**${local}**`).setColor('#FF9999').setDescription(weatherDesc[i]).setTimestamp();

        if (embed.description.length > 2000) {
            embed.description = `${embed.description.substr(0, 1997)}...`;
        }
        embeds.push(embed);
    }
    return embeds;
}

module.exports = {
    usage: `${client.prefix}날씨 (지역)`,
    command: ['날씨', 'ㄴㅆ'],
    description: '- 입력한 지역의 날씨를 알려줍니다.',
    channelCool: true,
    type: ['기타'],
    async execute(message, args) {
        const search = args.length > 0 ? args.join(' ') : '동대문구 전농동';
        const searchRslt = (await (await fetch(`https://ac.weather.naver.com/ac?q_enc=utf-8&r_format=json&r_enc=utf-8&r_lt=1&st=1&q=${encodeURIComponent(search)}`)).json()).items[0];
        let targetLocal;
        if (!searchRslt?.length) {
            return message.channel.send('검색된 지역이 없습니다.');
        } else if (searchRslt.length === 1) {
            targetLocal = searchRslt[0];
        } else {
            const locallistEmbed = new MessageEmbed()
                .setTitle('**검색할 지역의 번호를 알려주세요.**')
                .setDescription(searchRslt.map((v, i) => `${i + 1}. ${v[0]}`).join('\n'))
                .setColor('#FF9999')
                .setTimestamp();
            message.channel.send(locallistEmbed);

            const rslt = await message.channel.awaitMessages((msg) => msg.author.id === message.author.id && !isNaN(msg.content) && 1 <= +msg.content && +msg.content <= searchRslt.length, {
                max: 1,
                time: 20000,
                errors: ['time']
            });
            targetLocal = searchRslt[Math.trunc(rslt.first().content) - 1];
        }

        const $ = load(await (await fetch(`https://weather.naver.com/today/${targetLocal[1][0]}`)).text());
        const nowWeather = $('.weather_area');
        const weatherDesc = [`현재 날씨\n\n현재온도: ${nowWeather.find('.current').contents()[1].data}° (${nowWeather.find('.summary > .weather').text()})`, '날씨 예보\n'];

        const summaryTerm = nowWeather.find('.summary_list > .term');
        const summaryDesc = nowWeather.find('.summary_list > .desc');
        for (let i = 0; i < summaryTerm.length; i++) {
            weatherDesc[0] += `${i % 2 ? '│' : '\n'}${summaryTerm.eq(i).text()}: ${summaryDesc.eq(i).text()}`;
        }

        const todayInfo = $('.today_chart_list .item_inner');
        for (let i = 0; i < todayInfo.length; i++) {
            weatherDesc[0] += `${i % 2 ? '│' : '\n'}${todayInfo.eq(i).find('.ttl').text()}: ${todayInfo.eq(i).find('.level_text').text()}`;
        }

        const weather = $('.time_list > .item_time');
        const rainData = $('div[data-name="rain"] .row_graph').eq(0); // 가끔 적설량이 병기되는 경우에 대응
        const rainName = rainData.find('.blind').text();
        const rainUnit = rainName === '적설량' ? '㎝' : '㎜';
        const rain = rainData.find('.data');
        const humidity = $('div[data-name="humidity"] .row_graph > .data');
        const wind = $('div[data-name="wind"] .row_graph > .data');

        for (let i = 0, j = 0, rainSpan = 1; i < weather.length - 1; i++) {
            rainSpan--;
            weatherDesc[1] += `\n${weather.eq(i).find('.time').text()}: ${weather.eq(i).attr('data-tmpr')}° (${weather.eq(i).attr('data-wetr-txt')})│${rainName}: ${rain
                .eq(j)
                .text()
                .trim()}${rainUnit}│습도: ${humidity.eq(i).text().trim()}%│풍속: ${wind.eq(i).text().trim()}㎧`;
            if (rainSpan === 0) {
                rainSpan = +(rain.eq(++j).attr('colspan') ?? 1);
            }
        }

        let currentPage = 0;
        const embeds = generateWeatherEmbed(targetLocal[0][0], weatherDesc);
        const weatherEmbed = await message.channel.send({ content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds: [embeds[currentPage]] });

        try {
            await weatherEmbed.react('⬅️');
            await weatherEmbed.react('⏹');
            await weatherEmbed.react('➡️');
        } catch {
            return message.channel.send('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
        }
        const filter = (_, user) => message.author.id === user.id;
        const collector = weatherEmbed.createReactionCollector({ filter, time: 60000 });

        collector.on('collect', async (reaction, user) => {
            try {
                if (message.guild) {
                    await reaction.users.remove(user);
                }
                switch (reaction.emoji.name) {
                    case '➡️':
                        currentPage = (currentPage + 1) % embeds.length;
                        weatherEmbed.edit({ content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds: [embeds[currentPage]] });
                        break;
                    case '⬅️':
                        currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                        weatherEmbed.edit({ content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds: [embeds[currentPage]] });
                        break;
                    case '⏹':
                        collector.stop();
                        break;
                }
            } catch {
                return message.channel.send('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
            }
        });
    }
};
