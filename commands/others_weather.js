import { fetch } from 'undici';
import { load } from 'cheerio';
import { MessageActionRow, MessageButton, MessageEmbed, Util } from '../util/discord.js-extend.js';

async function getWeatherEmbed(targetLocal) {
    const targetURL = `https://weather.naver.com/today/${targetLocal[1][0]}`;
    const $ = load(await (await fetch(targetURL)).text());
    const nowWeather = $('.weather_area');
    const weatherDesc = [
        `현재 날씨\n\n현재온도: ${nowWeather.find('.current').contents()[1].data}° (${nowWeather
            .find('.summary > .weather')
            .text()})`,
        '날씨 예보\n'
    ];

    if (targetLocal[1][0].includes('WD')) {
        // 해외 날씨
        const summaryTerm = nowWeather.find('.summary_list > .term');
        const summaryDesc = nowWeather.find('.summary_list > .desc');
        for (let i = 0; i < summaryTerm.length; i++) {
            weatherDesc[0] += `${i % 2 ? '│' : '\n'}${summaryTerm.eq(i).text()}: ${summaryDesc.eq(i).text()}`;
        }

        const todayInfo = $('.today_chart_list .item_inner');
        for (let i = 0; i < todayInfo.length; i++) {
            weatherDesc[0] += `${i % 2 ? '│' : '\n'}${todayInfo.eq(i).find('.ttl').text()}: ${todayInfo
                .eq(i)
                .find('.level_text')
                .text()}`;
        }

        const weather = $('.time_list > .item_time');
        const rain = $('div[data-name="rain"] .row_graph.row_rain > .data');
        const humidity = $('div[data-name="humidity"] .row_graph > .data');
        const wind = $('div[data-name="wind"] .row_graph > .data');
        for (let i = 0; i < weather.length - 1; i++) {
            weatherDesc[1] += `\n${weather.eq(i).find('.time').text()}: ${weather.eq(i).attr('data-tmpr')}° (${weather
                .eq(i)
                .attr('data-wetr-txt')})│강수량: ${rain.eq(i).text().trim()}㎜│습도: ${humidity
                .eq(i)
                .text()
                .trim()}%│풍속: ${wind.eq(i).text().trim()}㎧`;
        }
    } else {
        // 국내 날씨
        const summary = JSON.parse(/var\s+weatherSummary\s*=\s*({.+?})\s*;/s.exec($.html())[1]);
        weatherDesc[0] += `\n습도: ${summary.nowFcast.humd}%│${summary.nowFcast.windDrctnName}: ${
            summary.nowFcast.windSpd
        }m/s
체감: ${summary.nowFcast.stmpr}°
미세먼지: ${summary.airFcast.stationPM10Legend1 || '-'}│초미세먼지: ${summary.airFcast.stationPM25Legend1 || '-'}
자외선: ${summary.uv.labelText}`;

        const castList = JSON.parse(/var\s+townFcastListJson\s*=\s*(\[.+?\])\s*;/s.exec($.html())[1]);
        for (let i = 0; i < castList.length - 1; i++) {
            weatherDesc[1] += `\n${+castList[i].aplTm}시: ${castList[i].tmpr}° (${castList[i + 1].wetrTxt})│강수량: ${
                castList[i + 1].rainAmt
            }㎜│습도: ${castList[i + 1].humd}%│풍속: ${castList[i + 1].windSpd}㎧`;
        }
    }

    const embeds = [];
    for (const desc of weatherDesc) {
        const embed = new MessageEmbed()
            .setTitle(`**${targetLocal[0][0]}**`)
            .setColor('#FF9999')
            .setURL(targetURL)
            .setDescription(Util.splitMessage(desc, { char: '\n' })[0])
            .setTimestamp();
        embeds.push(embed);
    }
    return embeds;
}

export const usage = `${client.prefix}날씨 (지역)`;
export const command = ['날씨', 'ㄴㅆ'];
export const description = '- 입력한 지역의 날씨를 알려줍니다.';
export const channelCool = true;
export const type = ['기타'];
export async function messageExecute(message, args) {
    const search = args.length > 0 ? args.join(' ') : '동대문구 전농1동';
    const searchRslt = (
        await (
            await fetch(
                `https://ac.weather.naver.com/ac?q_enc=utf-8&r_format=json&r_enc=utf-8&r_lt=1&st=1&q=${encodeURIComponent(
                    search
                )}`
            )
        ).json()
    ).items[0];
    let targetLocal;
    if (!searchRslt?.length) {
        return message.channel.send('검색된 지역이 없습니다.');
    } else if (searchRslt.length === 1) {
        targetLocal = searchRslt[0];
    } else {
        const localListEmbed = new MessageEmbed()
            .setTitle('**검색할 지역의 번호를 알려주세요.**')
            .setColor('#FF9999')
            .setDescription(searchRslt.map((v, i) => `${i + 1}. ${v[0]}`).join('\n'))
            .setTimestamp();
        message.channel.send({ embeds: [localListEmbed] });

        const rslt = await message.channel.awaitMessages({
            filter: (msg) =>
                msg.author.id === message.author.id &&
                !isNaN(msg.content) &&
                1 <= +msg.content &&
                +msg.content <= searchRslt.length,
            max: 1,
            time: 20000,
            errors: ['time']
        });
        targetLocal = searchRslt[Math.trunc(rslt.first().content) - 1];
    }

    let currentPage = 0;
    const embeds = await getWeatherEmbed(targetLocal);
    const row = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('prev').setEmoji('⬅️').setStyle('SECONDARY'),
        new MessageButton().setCustomId('stop').setEmoji('⏹️').setStyle('SECONDARY'),
        new MessageButton().setCustomId('next').setEmoji('➡️').setStyle('SECONDARY')
    );
    const weatherEmbed = await message.channel.send({
        content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
        embeds: [embeds[currentPage]],
        components: [row]
    });

    const filter = (itr) => message.author.id === itr.user.id;
    const collector = weatherEmbed.createMessageComponentCollector({ filter, time: 120000 });

    collector.on('collect', async (itr) => {
        try {
            switch (itr.customId) {
                case 'next':
                    currentPage = (currentPage + 1) % embeds.length;
                    await weatherEmbed.edit({
                        content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                        embeds: [embeds[currentPage]]
                    });
                    break;
                case 'prev':
                    currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                    await weatherEmbed.edit({
                        content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                        embeds: [embeds[currentPage]]
                    });
                    break;
                case 'stop':
                    collector.stop();
                    break;
            }
        } catch {}
    });
}
export const commandData = {
    name: '날씨',
    description: '입력한 지역의 날씨를 알려줍니다.',
    options: [
        {
            name: '지역',
            type: 'STRING',
            description: '날씨 정보를 검색할 지역'
        }
    ]
};
export async function commandExecute(interaction) {
    const search = interaction.options.getString('지역') ?? '동대문구 전농1동';
    const searchRslt = (
        await (
            await fetch(
                `https://ac.weather.naver.com/ac?q_enc=utf-8&r_format=json&r_enc=utf-8&r_lt=1&st=1&q=${encodeURIComponent(
                    search
                )}`
            )
        ).json()
    ).items[0];
    let targetLocal;
    if (!searchRslt?.length) {
        return interaction.followUp('검색된 지역이 없습니다.');
    } else if (searchRslt.length === 1) {
        targetLocal = searchRslt[0];
    } else {
        const localListEmbed = new MessageEmbed()
            .setTitle('**검색할 지역의 번호를 알려주세요.**')
            .setColor('#FF9999')
            .setDescription(searchRslt.map((v, i) => `${i + 1}. ${v[0]}`).join('\n'))
            .setTimestamp();
        await interaction.editReply({ embeds: [localListEmbed] });

        const rslt = await interaction.channel.awaitMessages({
            filter: (msg) =>
                msg.author.id === interaction.user.id &&
                !isNaN(msg.content) &&
                1 <= +msg.content &&
                +msg.content <= searchRslt.length,
            max: 1,
            time: 20000,
            errors: ['time']
        });
        targetLocal = searchRslt[Math.trunc(rslt.first().content) - 1];
    }

    let currentPage = 0;
    const embeds = await getWeatherEmbed(targetLocal);
    const row = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('prev').setEmoji('⬅️').setStyle('SECONDARY'),
        new MessageButton().setCustomId('stop').setEmoji('⏹️').setStyle('SECONDARY'),
        new MessageButton().setCustomId('next').setEmoji('➡️').setStyle('SECONDARY')
    );
    const weatherEmbed = await interaction.followUp({
        content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
        embeds: [embeds[currentPage]],
        components: [row]
    });

    const filter = (itr) => interaction.user.id === itr.user.id;
    const collector = weatherEmbed.createMessageComponentCollector({ filter, time: 120000 });

    collector.on('collect', async (itr) => {
        try {
            switch (itr.customId) {
                case 'next':
                    currentPage = (currentPage + 1) % embeds.length;
                    await weatherEmbed.edit({
                        content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                        embeds: [embeds[currentPage]]
                    });
                    break;
                case 'prev':
                    currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                    await weatherEmbed.edit({
                        content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                        embeds: [embeds[currentPage]]
                    });
                    break;
                case 'stop':
                    collector.stop();
                    break;
            }
        } catch {}
    });
}
