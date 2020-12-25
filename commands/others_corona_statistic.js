const { CORONA_API_KEY } = require('../soyabot_config.json');
const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');
const QuickChart = require('quickchart-js');

function calcIncrease(data) {
    return `${data >= 0 ? `⬆️ ${data.toLocaleString()}` : `⬇️ ${(-data).toLocaleString()}`}`;
}

module.exports = {
    usage: `${client.prefix}코로나`,
    command: ["코로나", "ㅋㄹㄴ"],
    description: '- 최신 기준 코로나 국내 현황을 알려줍니다.',
    type: ["기타"],
    async execute(message) {
        const response = await fetch(`https://api.corona-19.kr/korea/?serviceKey=${CORONA_API_KEY}`);
        const data = await response.json();

        if (data.resultCode == "0") {
            const rateData = [[data.city1n, data.city2n, data.city3n, data.city4n, data.city5n], [data.city1p, data.city2p, data.city3p, data.city4p, data.city5p]];
            const colorData = { "서울": "rgb(216, 76, 74)", "경기": "rgb(232, 116, 115)", "대구": "rgb(238, 145, 144)", "인천": "rgb(244, 200, 200)", "기타": "rgb(227, 227, 227)" };
            const updateDate = /\((.+)\)/.exec(data.updateTime)[1];

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
                                    text: "확진환자 지역별 비율",
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

            const todayRecover = +data.TodayRecovered;
            const todayCase = +data.TotalCaseBefore;
            const todayDeath = +data.TodayDeath;
            const todaySum = todayRecover + todayCase + todayDeath;

            const coronaEmbed = new MessageEmbed()
                .setTitle(`${updateDate} 코로나 국내 현황`)
                .setThumbnail("http://140.238.26.231:8170/image/hosting/mohw.png")
                .setColor("#F8AA2A")
                .setURL("http://ncov.mohw.go.kr")
                .setImage(await coronaChart.getShortUrl())
                .addField('**확진 환자**', `${data.TotalCase} (${calcIncrease(todaySum)})`)
                .addField('**격리 해제**', `${data.TotalRecovered} (${calcIncrease(todayRecover)})`)
                .addField('**격리 중**', `${data.NowCase} (${calcIncrease(todayCase)})`)
                .addField('**사망자**', `${data.TotalDeath} (${calcIncrease(todayDeath)})`)
                .addField('**검사 중**', data.checkingCounter);

            return message.channel.send(coronaEmbed);
        }
        else {
            return message.channel.send('코로나 현황을 조회할 수 없습니다.');
        }
    }
};