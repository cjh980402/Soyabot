import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, ApplicationCommandOptionType } from 'discord.js';
import { request } from 'undici';
import { load } from 'cheerio';
import { sendPageMessage } from '../util/soyabot_util.js';
import { Util } from '../util/Util.js';

async function getWeatherEmbed(targetLocal) {
    const targetURL = `https://weather.naver.com/today/${targetLocal[1][0]}`;
    const { body } = await request(targetURL);
    const $ = load(await body.text());
    const nowWeather = $('.weather_area');
    const weatherDesc = [
        `현재 날씨\n\n현재온도: ${nowWeather.find('.current').contents()[2].data}° (${nowWeather
            .find('.summary > .weather')
            .text()})`,
        '날씨 예보\n'
    ];

    if (targetLocal[1][0].includes('WD')) {
        // 해외 날씨
        const summaryTerm = nowWeather.find('.weather_table td dt');
        const summaryDesc = nowWeather.find('.weather_table td dd');
        for (let i = 0; i < summaryTerm.length; i++) {
            weatherDesc[0] += `${i % 2 ? '│' : '\n'}${summaryTerm.eq(i).text()}: ${summaryDesc.eq(i).text()}`;
        }
    } else {
        // 국내 날씨
        const summary = JSON.parse(/var\s+weatherSummary\s*=\s*({.+?})\s*;/s.exec($.html())[1]);
        weatherDesc[0] += `\n체감: ${summary.nowFcast.stmpr}°│자외선: ${summary.uv.labelText}
습도: ${summary.nowFcast.humd}%│${summary.nowFcast.windDrctnName}: ${summary.nowFcast.windSpd}m/s
미세먼지: ${
            summary.airFcast.stationPM10Legend1
                ? `${summary.airFcast.stationPM10Legend1} (${summary.airFcast.stationPM10}㎍/㎥)`
                : '-'
        }
초미세먼지: ${
            summary.airFcast.stationPM25Legend1
                ? `${summary.airFcast.stationPM25Legend1} (${summary.airFcast.stationPM25}㎍/㎥)`
                : '-'
        }`;
    }

    const castList = JSON.parse(/var\s+hourlyFcastListJson\s*=\s*(\[.+?\])\s*;/s.exec($.html())[1]);
    for (let i = 0; i < castList.length; i++) {
        weatherDesc[1] += `\n${+castList[i].aplTm}시: ${castList[i].tmpr}° (${
            castList[i].wetrTxt ?? castList[i].wetrTxtNew
        })│강수량: ${castList[i].rainAmt}㎜│습도: ${castList[i].humd}%│풍속: ${castList[i].windSpd}㎧`;
    }

    const embeds = [];
    for (const desc of weatherDesc) {
        const embed = new EmbedBuilder()
            .setTitle(`**${targetLocal[0][0]}**`)
            .setColor('#FF9999')
            .setURL(targetURL)
            .setDescription(Util.splitMessage(desc)[0])
            .setTimestamp();
        embeds.push(embed);
    }
    return embeds;
}

export const type = '기타';
export const commandData = {
    name: '날씨',
    description: '입력한 지역의 날씨를 알려줍니다.',
    options: [
        {
            name: '지역',
            type: ApplicationCommandOptionType.String,
            description: '날씨 정보를 검색할 지역'
        }
    ]
};
export async function commandExecute(interaction) {
    const search = interaction.options.getString('지역') ?? '동대문구 전농1동';
    const { body } = await request(
        `https://ac.weather.naver.com/ac?q_enc=utf-8&r_format=json&r_enc=utf-8&r_lt=1&st=1&q=${encodeURIComponent(
            search
        )}`
    );
    const searchRslt = (await body.json()).items[0]?.slice(0, 25);
    let targetLocal;
    if (!searchRslt?.length) {
        return interaction.followUp('검색된 지역이 없습니다.');
    } else if (searchRslt.length === 1) {
        targetLocal = searchRslt[0];
    } else {
        const row = new ActionRowBuilder().addComponents([
            new StringSelectMenuBuilder()
                .setCustomId('select_menu')
                .setPlaceholder(`총 ${searchRslt.length}지역이 검색되었습니다.`)
                .addOptions(
                    searchRslt.map((v, i) => ({
                        label: v[0][0],
                        value: String(i)
                    }))
                )
        ]);

        const list = await interaction.followUp({ content: '검색할 지역을 선택해주세요.', components: [row] });
        try {
            const choiceMenu = await list.awaitMessageComponent({
                filter: (itr) => itr.user.id === interaction.user.id,
                time: 15000
            });
            await choiceMenu.deferUpdate();
            targetLocal = searchRslt[choiceMenu.values[0]];
        } catch {
            targetLocal = searchRslt[0];
        } finally {
            try {
                row.components[0].setDisabled(true);
                await list.edit({ components: [row] });
            } catch {}
        }
    }

    const embeds = await getWeatherEmbed(targetLocal);
    await sendPageMessage(interaction, embeds);
}
