const renderChart = require('../util/chartjs_rendering');
const { CORONA_API_KEY } = require('../soyabot_config.json');
const { MessageEmbed } = require('../util/discord.js-extend');
const { writeFile } = require('fs').promises;
const fetch = require('node-fetch');

function calcIncrease(data) {
    return `${data >= 0 ? `⬆️ ${data.toLocaleString()}` : `⬇️ ${(-data).toLocaleString()}`}`;
}

function colorData(cityList) {
    const colorList = ['rgb(216, 75, 75)', 'rgb(232, 115, 115)', 'rgb(238, 145, 145)', 'rgb(244, 200, 200)', 'rgb(227, 227, 227)'];
    return cityList.map((v) => (v === '기타' ? 'rgb(227, 227, 227)' : colorList.shift()));
}

async function getCoronaEmbed(countData, countryData) {
    const rateData = [
        [countData.city1n, countData.city2n, countData.city3n, countData.city4n, countData.city5n],
        [countData.city1p, countData.city2p, countData.city3p, countData.city4p, countData.city5p]
    ];
    const updateDate = /\((.+)\)/.exec(countData.updateTime)[1];

    const config = {
        type: 'doughnut', // 도넛 모양 차트
        data: {
            labels: rateData[0],
            datasets: [
                {
                    label: '지역별 비율',
                    data: rateData[1],
                    backgroundColor: colorData(rateData[0])
                }
            ]
        },
        options: {
            plugins: {
                datalabels: {
                    // 데이터 값 표시
                    formatter: (value, context) => `${context.chart.data.labels[context.dataIndex]}\n${value}%`,
                    color: 'black',
                    textAlign: 'center',
                    display: true,
                    font: { size: 22 }
                },
                doughnutlabel: {
                    labels: [
                        {
                            text: '확진 환자 지역별 비율',
                            font: {
                                size: 25,
                                weight: 'bold'
                            }
                        },
                        {
                            text: `(${updateDate})`,
                            font: {
                                size: 25,
                                weight: 'bold'
                            }
                        }
                    ]
                }
            },
            legend: { display: false }
        }
    };

    const todayRecover = +countData.TodayRecovered;
    const todayCase = +countData.TotalCaseBefore;
    const todayDeath = +countData.TodayDeath;
    const todaySum = todayRecover + todayCase + todayDeath;
    await writeFile('./pictures/chart/corona.png', await renderChart(config, 600, 600));

    const corona1 = new MessageEmbed()
        .setTitle(`**${updateDate}**`)
        .setThumbnail(`http://${client.botDomain}/image/hosting/mohw.png`)
        .setColor('#FF9999')
        .setURL('http://ncov.mohw.go.kr')
        .setImage(`http://${client.botDomain}/image/chart/corona.png?time=${Date.now()}`)
        .addField('**확진 환자**', `${countData.TotalCase} (${calcIncrease(todaySum)})`)
        .addField('**격리 해제**', `${countData.TotalRecovered} (${calcIncrease(todayRecover)})`)
        .addField('**격리 중**', `${countData.NowCase} (${calcIncrease(todayCase)})`)
        .addField('**사망자**', `${countData.TotalDeath} (${calcIncrease(todayDeath)})`)
        .addField('**검사 중**', countData.checkingCounter)
        .setTimestamp();

    const rslt = Object.values(countryData)
        .filter((v) => v instanceof Object)
        .sort((a, b) => +b.newCase.replace(/,/g, '') - +a.newCase.replace(/,/g, ''))
        .map((v) => `${v.countryName}: ${v.totalCase} (국내: ⬆️ ${v.newCcase}, 해외: ⬆️ ${v.newFcase})`);
    const corona2 = new MessageEmbed()
        .setTitle('**지역별 확진 환자 현황**')
        .setThumbnail(`http://${client.botDomain}/image/hosting/mohw.png`)
        .setColor('#FF9999')
        .setURL('http://ncov.mohw.go.kr')
        .setDescription(`${rslt.shift()}\n\n${rslt.join('\n')}`)
        .setTimestamp();

    return [corona1, corona2];
}

module.exports = {
    usage: `${client.prefix}코로나`,
    command: ['코로나', 'ㅋㄹㄴ'],
    description: '- 최신 기준 코로나 국내 현황 통계를 알려줍니다.',
    type: ['기타'],
    async messageExecute(message) {
        const countData = await (await fetch(`https://api.corona-19.kr/korea/?serviceKey=${CORONA_API_KEY}`)).json();
        const countryData = await (await fetch(`https://api.corona-19.kr/korea/country/new/?serviceKey=${CORONA_API_KEY}`)).json();

        if (countData.resultCode === '0' && countryData.resultCode === '0') {
            let currentPage = 0;
            const embeds = await getCoronaEmbed(countData, countryData);
            const coronaEmbed = await message.channel.send({ content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds: [embeds[currentPage]] });

            try {
                await coronaEmbed.react('⬅️');
                await coronaEmbed.react('⏹');
                await coronaEmbed.react('➡️');
            } catch {
                return message.channel.send('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
            }
            const filter = (_, user) => message.author.id === user.id;
            const collector = coronaEmbed.createReactionCollector({ filter, time: 60000 });

            collector.on('collect', async (reaction, user) => {
                try {
                    if (message.guildId) {
                        await reaction.users.remove(user);
                    }
                    switch (reaction.emoji.name) {
                        case '➡️':
                            currentPage = (currentPage + 1) % embeds.length;
                            coronaEmbed.edit({ content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds: [embeds[currentPage]] });
                            break;
                        case '⬅️':
                            currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                            coronaEmbed.edit({ content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds: [embeds[currentPage]] });
                            break;
                        case '⏹':
                            collector.stop();
                            break;
                    }
                } catch {
                    message.channel.send('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
                }
            });
        } else {
            return message.channel.send('코로나 현황을 조회할 수 없습니다.');
        }
    },
    interaction: {
        name: '코로나',
        description: '최신 기준 코로나 국내 현황 통계를 알려줍니다.'
    },
    async commandExecute(interaction) {
        const countData = await (await fetch(`https://api.corona-19.kr/korea/?serviceKey=${CORONA_API_KEY}`)).json();
        const countryData = await (await fetch(`https://api.corona-19.kr/korea/country/new/?serviceKey=${CORONA_API_KEY}`)).json();

        if (countData.resultCode === '0' && countryData.resultCode === '0') {
            let currentPage = 0;
            const embeds = await getCoronaEmbed(countData, countryData);
            const coronaEmbed = await interaction.editReply({ content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds: [embeds[currentPage]] });

            try {
                await coronaEmbed.react('⬅️');
                await coronaEmbed.react('⏹');
                await coronaEmbed.react('➡️');
            } catch {
                return interaction.followUp('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
            }
            const filter = (_, user) => interaction.user.id === user.id;
            const collector = coronaEmbed.createReactionCollector({ filter, time: 60000 });

            collector.on('collect', async (reaction, user) => {
                try {
                    if (interaction.guildId) {
                        await reaction.users.remove(user);
                    }
                    switch (reaction.emoji.name) {
                        case '➡️':
                            currentPage = (currentPage + 1) % embeds.length;
                            coronaEmbed.edit({ content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds: [embeds[currentPage]] });
                            break;
                        case '⬅️':
                            currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                            coronaEmbed.edit({ content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds: [embeds[currentPage]] });
                            break;
                        case '⏹':
                            collector.stop();
                            break;
                    }
                } catch {
                    interaction.followUp('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
                }
            });
        } else {
            return interaction.followUp('코로나 현황을 조회할 수 없습니다.');
        }
    }
};
