const { MessageEmbed } = require('../util/discord.js-extend');
const fetch = require('node-fetch');
const { load } = require('cheerio');

async function getWeatherEmbed(targetLocal) {
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
    const rain = $('div[data-name="rain"] .row_graph.row_rain > .data');

    if (rain.length > 0) {
        const humidity = $('div[data-name="humidity"] .row_graph > .data');
        const wind = $('div[data-name="wind"] .row_graph > .data');
        for (let i = 0; i < weather.length - 1; i++) {
            weatherDesc[1] += `\n${weather.eq(i).find('.time').text()}: ${weather.eq(i).attr('data-tmpr')}° (${weather.eq(i).attr('data-wetr-txt')})│강수량: ${rain
                .eq(i)
                .text()
                .trim()}㎜│습도: ${humidity.eq(i).text().trim()}%│풍속: ${wind.eq(i).text().trim()}㎧`;
        }
    } else {
        let data = $('body > script').filter((_, v) => /\[{.+naverRgnCd.+}\]/.test($(v).html()));
        data = JSON.parse(/\[{.+naverRgnCd.+}\]/.exec(data.eq(0).html())[0]);
        for (let i = 0; i < weather.length - 1; i++) {
            weatherDesc[1] += `\n${weather.eq(i).find('.time').text()}: ${weather.eq(i).attr('data-tmpr')}° (${weather.eq(i).attr('data-wetr-txt')})│강수량: ${data[i + 1].rainAmt}㎜│습도: ${
                data[i + 1].humd
            }%│풍속: ${data[i + 1].windSpd}㎧`;
        }
    }

    const embeds = [];
    for (let i = 0; i < weatherDesc.length; i++) {
        const embed = new MessageEmbed().setTitle(`**${targetLocal[0][0]}**`).setColor('#FF9999').setDescription(weatherDesc[i]).setTimestamp();

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
    async messageExecute(message, args) {
        const search = args.length > 0 ? args.join(' ') : '동대문구 전농동';
        const searchRslt = (await (await fetch(`https://ac.weather.naver.com/ac?q_enc=utf-8&r_format=json&r_enc=utf-8&r_lt=1&st=1&q=${encodeURIComponent(search)}`)).json()).items[0];
        let targetLocal;
        if (!searchRslt?.length) {
            return message.channel.send('검색된 지역이 없습니다.');
        } else if (searchRslt.length === 1) {
            targetLocal = searchRslt[0];
        } else {
            const localListEmbed = new MessageEmbed()
                .setTitle('**검색할 지역의 번호를 알려주세요.**')
                .setDescription(searchRslt.map((v, i) => `${i + 1}. ${v[0]}`).join('\n'))
                .setColor('#FF9999')
                .setTimestamp();
            message.channel.send({ embeds: [localListEmbed] });

            const rslt = await message.channel.awaitMessages({
                filter: (msg) => msg.author.id === message.author.id && !isNaN(msg.content) && 1 <= +msg.content && +msg.content <= searchRslt.length,
                max: 1,
                time: 20000,
                errors: ['time']
            });
            targetLocal = searchRslt[Math.trunc(rslt.first().content) - 1];
        }

        let currentPage = 0;
        const embeds = await getWeatherEmbed(targetLocal);
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
                message.channel.send('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
            }
        });
    },
    interaction: {
        name: '날씨',
        description: '입력한 지역의 날씨를 알려줍니다.',
        options: [
            {
                name: '지역',
                type: 'STRING',
                description: '날씨 정보를 검색할 지역'
            }
        ]
    },
    async interactionExecute(interaction) {
        const search = interaction.options.get('지역')?.value ?? '동대문구 전농동';
        const searchRslt = (await (await fetch(`https://ac.weather.naver.com/ac?q_enc=utf-8&r_format=json&r_enc=utf-8&r_lt=1&st=1&q=${encodeURIComponent(search)}`)).json()).items[0];
        let targetLocal;
        if (!searchRslt?.length) {
            return interaction.editReply('검색된 지역이 없습니다.');
        } else if (searchRslt.length === 1) {
            targetLocal = searchRslt[0];
        } else {
            const localListEmbed = new MessageEmbed()
                .setTitle('**검색할 지역의 번호를 알려주세요.**')
                .setDescription(searchRslt.map((v, i) => `${i + 1}. ${v[0]}`).join('\n'))
                .setColor('#FF9999')
                .setTimestamp();
            interaction.editReply({ embeds: [localListEmbed] });

            const rslt = await interaction.channel.awaitMessages({
                filter: (msg) => msg.author.id === interaction.user.id && !isNaN(msg.content) && 1 <= +msg.content && +msg.content <= searchRslt.length,
                max: 1,
                time: 20000,
                errors: ['time']
            });
            targetLocal = searchRslt[Math.trunc(rslt.first().content) - 1];
        }

        let currentPage = 0;
        const embeds = await getWeatherEmbed(targetLocal);
        const weatherEmbed = await interaction.followUp({ content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds: [embeds[currentPage]], fetchReply: true });

        try {
            await weatherEmbed.react('⬅️');
            await weatherEmbed.react('⏹');
            await weatherEmbed.react('➡️');
        } catch {
            return interaction.followUp('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
        }
        const filter = (_, user) => interaction.user.id === user.id;
        const collector = weatherEmbed.createReactionCollector({ filter, time: 60000 });

        collector.on('collect', async (reaction, user) => {
            try {
                if (interaction.guild) {
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
                interaction.followUp('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
            }
        });
    }
};
