const { MessageEmbed } = require('../util/discord.js-extend');
const fetch = require('node-fetch');
const QuickChart = require('quickchart-js');
const serverList = {
    스카니아: 'server1',
    베라: 'server2',
    루나: 'server3',
    제니스: 'server4',
    크로아: 'server5',
    유니온: 'server6',
    엘리시움: 'server7',
    이노시스: 'server8',
    레드: 'server9',
    오로라: 'server10',
    아케인: 'server11',
    노바: 'server12'
};

module.exports = {
    usage: `${client.prefix}메소 (서버)`,
    command: ['메소', 'ㅁㅅ'],
    description: '- 해당 서버의 메소 시세를 알려줍니다. 서버 이름은 정확히 입력해야 합니다.',
    type: ['메이플'],
    async execute(message, args) {
        if (args.length != 1 || !serverList[args[0]]) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const response = await fetch('https://commapi.gamemarket.kr/comm/graph', {
            method: 'POST',
            headers: {
                'Host': 'commapi.gamemarket.kr',
                'Connection': 'keep-alive',
                'Content-Length': 0,
                'Accept': 'application/json',
                'Origin': 'https://talk.gamemarket.kr',
                'Referer': 'https://talk.gamemarket.kr/',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'ko,en;q=0.9,en-US;q=0.8'
            }
        });
        const data = await response.json();
        const market = data.dbo;
        const direct = data.dbo2;
        // 각각 배열, 길이는 15, 앞에서부터 과거 날짜
        const server = args[0];

        const mesoChart = new QuickChart();
        mesoChart
            .setConfig({
                type: 'line',
                data: {
                    labels: market.map((v) => new Date(v.reg_date).toLocaleDateString().substr(6)),
                    datasets: [
                        {
                            label: '메소마켓(메포)',
                            data: market.map((v) => v[serverList[server]]),
                            lineTension: 0.4,
                            fill: false,
                            borderWidth: 6,
                            pointRadius: 6
                        },
                        {
                            label: '무통거래(원)',
                            data: direct.map((v) => v[serverList[server]]),
                            lineTension: 0.4,
                            fill: false,
                            borderWidth: 6,
                            pointRadius: 6
                        }
                    ]
                },
                options: {
                    plugins: {
                        datalabels: {
                            // 데이터 값 표시
                            color: 'black',
                            display: true,
                            anchor: 'end',
                            align: 'end',
                            font: {
                                size: 23
                            }
                        }
                    },
                    scales: {
                        xAxes: [
                            {
                                gridLines: {
                                    lineWidth: 3
                                },
                                ticks: {
                                    fontSize: 23
                                }
                            }
                        ],
                        yAxes: [
                            {
                                gridLines: {
                                    lineWidth: 3
                                },
                                ticks: {
                                    fontSize: 23
                                }
                            }
                        ]
                    },
                    title: {
                        display: true,
                        fontSize: 26,
                        text: `${server} 서버 메소시세`
                    },
                    legend: {
                        labels: {
                            fontSize: 23
                        }
                    }
                }
            })
            .setWidth(1200)
            .setHeight(975)
            .setBackgroundColor('white');

        const mesoEmbed = new MessageEmbed()
            .setTitle(`**${server} 서버 메소 시세**`)
            .setURL('https://talk.gamemarket.kr/maple/graph')
            .setColor('#FF9899')
            .setImage(mesoChart.getUrl())
            .addField('**메소마켓**', `${market[market.length - 1][serverList[server]]}메포`)
            .addField('**무통거래**', `${direct[direct.length - 1][serverList[server]]}원`);

        return message.channel.send(mesoEmbed);
    }
};
