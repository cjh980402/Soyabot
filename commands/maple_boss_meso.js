const { MessageAttachment } = require('../util/discord.js-extend');
const renderChart = require('../util/chartjs_rendering');
const fetch = require('node-fetch');
const typeList = {
    월간보스: 'month',
    주간보스1: 'week1',
    주간보스2: 'week2',
    일간보스: 'day'
};

async function getBossMesoEmbed(type) {
    const params = new URLSearchParams();
    params.append('date', 10);
    params.append('type', typeList[type]);
    const response = await fetch('http://wachan.me/boss_api2.php', {
        method: 'POST',
        body: params
    });
    const data = await response.json();
    const parsedData = [];
    for (let i = 0; i < data[0].length; i++) {
        parsedData.push([]);
        for (let j = 0; j < data.length; j++) {
            parsedData[i].push(data[j][i]);
        }
    }

    const config = {
        type: 'line',
        data: {
            labels: parsedData[0].slice(1),
            datasets: parsedData.slice(1).map((v) => {
                const color = v[0].hashCode() & 0xffffff;
                let r = (color >> 16) & 0xff;
                let g = (color >> 8) & 0xff;
                let b = color & 0xff;
                if (r >= 0xc8 && g >= 0xc8 && b >= 0xc8) {
                    // 흰 색에 가까운 경우 어둡게 처리
                    r %= 0xc8;
                    g %= 0xc8;
                    b %= 0xc8;
                }
                return {
                    label: v.shift(),
                    data: v,
                    lineTension: 0.4,
                    fill: false,
                    borderColor: `rgb(${r}, ${g}, ${b})`,
                    borderWidth: 6,
                    pointBackgroundColor: `rgb(${r}, ${g}, ${b})`,
                    pointRadius: 6
                };
            })
        },
        options: {
            plugins: {
                datalabels: { display: false } // 데이터 값 표시하지 않음
            },
            scales: {
                xAxes: [
                    {
                        gridLines: { lineWidth: 3 },
                        ticks: { fontSize: 23 }
                    }
                ],
                yAxes: [
                    {
                        gridLines: { lineWidth: 3 },
                        ticks: { fontSize: 23 }
                    }
                ]
            },
            title: {
                display: true,
                fontSize: 26,
                text: `${type} 결정석 시세 변화`
            },
            legend: {
                labels: { fontSize: 23 }
            }
        }
    };

    return new MessageAttachment(await renderChart(config, 1500, 1000), 'boss_meso.png');
}

module.exports = {
    usage: `${client.prefix}보스결정석 (보스 종류)`,
    command: ['보스결정석', 'ㅂㅅㄱㅈㅅ', 'ㅄㄱㅈㅅ'],
    description: `- 보스 종류에 해당하는 보스들의 결정석 시세 변화를 보여줍니다.\n- (보스 종류): ${Object.keys(typeList).join(', ')} 입력가능`,
    type: ['메이플'],
    async messageExecute(message, args) {
        if (args.length !== 1 || !typeList[args[0]]) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        return message.channel.send({ files: [await getBossMesoEmbed(args[0])] });
    },
    commandData: {
        name: '보스결정석',
        description: '보스 종류에 해당하는 보스들의 결정석 시세 변화를 보여줍니다.',
        options: [
            {
                name: '보스_종류',
                type: 'STRING',
                description: '결정석 시세 변화를 검색할 서버',
                required: true,
                choices: Object.keys(typeList).map((v) => ({ name: v, value: v }))
            }
        ]
    },
    async commandExecute(interaction) {
        return interaction.followUp({ files: [await getBossMesoEmbed(interaction.options.getString('보스_종류'))] });
    }
};
