const { CORONA_API_KEY } = require('../soyabot_config.json');
const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');
const QuickChart = require('quickchart-js');

module.exports = {
    usage: `${client.prefix}코로나`,
    command: ["코로나", "ㅋㄹㄴ"],
    description: '- 최신 기준 코로나 국내 현황 통계를 알려줍니다.',
    type: ["기타"],
    async execute(message) {
        const countData = await (await fetch(`https://api.corona-19.kr/korea/?serviceKey=${CORONA_API_KEY}`)).json();
        const countryData = await (await fetch(`https://api.corona-19.kr/korea/country/new/?serviceKey=${CORONA_API_KEY}`)).json();

        if (countData.resultCode == "0" && countryData.resultCode == "0") {
            const rateData = [[countData.city1n, countData.city2n, countData.city3n, countData.city4n, countData.city5n], [countData.city1p, countData.city2p, countData.city3p, countData.city4p, countData.city5p]];
            const colorData = { "서울": "rgb(216, 76, 74)", "경기": "rgb(232, 116, 115)", "대구": "rgb(238, 145, 144)", "인천": "rgb(244, 200, 200)", "기타": "rgb(227, 227, 227)" };
            const updateDate = /\((.+)\)/.exec(countData.updateTime)[1];

            const coronaChart = new QuickChart();
            coronaChart
                .setConfig({
                    type: 'doughnut', // 도넛 모양 차트
                    data: {
                        labels: rateData[0],
                        datasets: [{
                            label: '지역별 비율',
                            data: rateData[1],
                            backgroundColor: rateData[0].map(v => colorData[v])
                        }]
                    },
                    options: {
                        plugins: {
                            datalabels: { // 데이터 값 표시
                                formatter: (value, context) => `${context.chart.data.labels[context.dataIndex]}\n${value}%`,
                                color: 'black',
                                display: true,
                                font: {
                                    size: 22
                                }
                            },
                            doughnutlabel: {
                                labels: [{
                                    text: "확진 환자 지역별 비율",
                                    font: {
                                        size: 25,
                                        weight: 'bold'
                                    }
                                }, {
                                    text: `(${updateDate})`,
                                    font: {
                                        size: 25,
                                        weight: 'bold'
                                    }
                                }]
                            }
                        },
                        legend: { display: false }
                    }
                })
                .setWidth(600)
                .setHeight(600)
                .setBackgroundColor('white');

            const todayRecover = +countData.TodayRecovered;
            const todayCase = +countData.TotalCaseBefore;
            const todayDeath = +countData.TodayDeath;
            const todaySum = todayRecover + todayCase + todayDeath;

            const coronaEmbed1 = new MessageEmbed()
                .setTitle(updateDate)
                .setThumbnail("http://140.238.26.231:8170/image/hosting/mohw.png")
                .setColor("#F8AA2A")
                .setURL("http://ncov.mohw.go.kr")
                .setImage(await coronaChart.getShortUrl())
                .addField('**확진 환자**', `${countData.TotalCase} (⬆️ ${todaySum.toLocaleString()})`)
                .addField('**격리 해제**', `${countData.TotalRecovered} (⬆️ ${todayRecover.toLocaleString()})`)
                .addField('**격리 중**', `${countData.NowCase} (⬆️ ${todayCase.toLocaleString()})`)
                .addField('**사망자**', `${countData.TotalDeath} (⬆️ ${todayDeath.toLocaleString()})`)
                .addField('**검사 중**', countData.checkingCounter)
                .setTimestamp();

            const rslt = Object.values(countryData).filter(v => v instanceof Object).sort((a, b) => +b.newCase.replace(/,/g, "") - +a.newCase.replace(/,/g, "")).map(v => `${v.countryName}: ${v.totalCase} (국내: ⬆️ ${v.newCcase}, 해외: ⬆️ ${v.newFcase})`);
            const coronaEmbed2 = new MessageEmbed()
                .setTitle("지역별 확진 환자 현황")
                .setThumbnail("http://140.238.26.231:8170/image/hosting/mohw.png")
                .setColor("#F8AA2A")
                .setURL("http://ncov.mohw.go.kr")
                .setDescription(`${rslt.shift()}\n\n${rslt.join("\n")}`)
                .setTimestamp();

            let currentPage = 0;
            const embeds = [coronaEmbed1, coronaEmbed2];
            const coronaEmbed = await message.channel.send(
                `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                embeds[currentPage]
            );

            try {
                await coronaEmbed.react("⬅️");
                await coronaEmbed.react("⏹");
                await coronaEmbed.react("➡️");
            }
            catch {
                return message.channel.send("**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**");
            }
            const filter = (reaction, user) => message.author.id == user.id;
            const collector = coronaEmbed.createReactionCollector(filter, { time: 60000 });

            collector.on("collect", async (reaction, user) => {
                try {
                    if (message.guild) {
                        await reaction.users.remove(user);
                    }
                    if (reaction.emoji.name == "➡️") {
                        currentPage = (currentPage + 1) % embeds.length;
                        coronaEmbed.edit(`**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                    }
                    else if (reaction.emoji.name == "⬅️") {
                        currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                        coronaEmbed.edit(`**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                    }
                    else if (reaction.emoji.name == "⏹") {
                        collector.stop();
                    }
                }
                catch {
                    return message.channel.send("**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**");
                }
            });
        }
        else {
            return message.channel.send('코로나 현황을 조회할 수 없습니다.');
        }
    }
};