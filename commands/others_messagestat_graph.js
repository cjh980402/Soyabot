const renderChart = require('../util/chartjs_rendering');
const { MessageAttachment } = require('../util/discord.js-extend');
const { ADMIN_ID } = require('../soyabot_config.json');

async function getMessageStatGraph(targetGuild, option) {
    const roommessage = (
        await db.all('SELECT * FROM messagedb WHERE channelsenderid LIKE ?', [`${targetGuild.id}%`]).asyncFilter(async (v) => {
            try {
                const senderid = v.channelsenderid.split(' ')[1];
                v.member = await targetGuild.members.fetch({ user: senderid, cache: false });
                return v.member && (option !== '-봇' || !v.member.user.bot);
            } catch {
                return false;
            }
        })
    )
        .sort((a, b) => b.lettercnt / b.messagecnt - a.lettercnt / a.messagecnt)
        .slice(0, 180); // 내림차순, 상위 180명
    const usercolor = (a) =>
        roommessage.map((v) => {
            const color = v.channelsenderid.split(' ')[1].hashCode() & 0xffffff;
            let r = (color >> 16) & 0xff;
            let g = (color >> 8) & 0xff;
            let b = color & 0xff;
            if (r >= 0xc8 && g >= 0xc8 && b >= 0xc8) {
                // 흰 색에 가까운 경우 어둡게 처리
                r %= 0xc8;
                g %= 0xc8;
                b %= 0xc8;
            }
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        });
    const height = Math.min(3000, 1200 + 20 * roommessage.length);
    const size = Math.min(40, Math.floor((0.85 * (height - 120 - 3 * (roommessage.length + 1))) / roommessage.length));
    const config = {
        type: 'horizontalBar',
        data: {
            labels: roommessage.map((v) => v.member.nickname ?? v.member.user.username),
            datasets: [
                {
                    label: '채팅지수',
                    data: roommessage.map((v) => (v.lettercnt / v.messagecnt).toFixed(2)),
                    backgroundColor: usercolor(0.5),
                    borderColor: usercolor(1),
                    borderWidth: 4,
                    maxBarThickness: 120
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
                    font: { size }
                }
            },
            scales: {
                xAxes: [
                    {
                        gridLines: { lineWidth: 3 },
                        ticks: {
                            fontSize: 30,
                            beginAtZero: true
                        }
                    }
                ], // X축 0부터 시작하게 하는 옵션
                yAxes: [
                    {
                        gridLines: { lineWidth: 3 },
                        ticks: { fontSize: size }
                    }
                ]
            },
            title: {
                display: true,
                fontSize: 35,
                text: `${targetGuild.name} 방의 채팅지수 그래프`
            },
            legend: { display: false }
        }
    };

    return new MessageAttachment(await renderChart(config, 2000, height), 'chart.png');
}

module.exports = {
    usage: `${client.prefix}채팅지수그래프 (옵션)`,
    command: ['채팅지수그래프', 'ㅊㅌㅈㅅㄱㄹㅍ', 'ㅊㅌㅈㅅㄱㄿ'],
    description: `- 상위 180명의 채팅지수 통계를 그래프로 보여줍니다.
- 옵션에 -봇을 넣어주면 통계에서 봇을 제외하고 보여줍니다. (생략 시 봇 포함)
- 채팅지수 = (공백 문자 제외 글자 개수) / 채팅량`,
    type: ['기타'],
    async messageExecute(message, args) {
        const targetGuild = (args.length > 0 && message.author.id === ADMIN_ID && client.guilds.cache.find((v) => v.name.includes(args.join(' ')))) || message.guild;
        if (!targetGuild) {
            return message.reply('사용이 불가능한 채널입니다.');
        }

        return message.channel.send({ files: [await getMessageStatGraph(targetGuild, args[0])] });
    },
    commandData: {
        name: '채팅지수그래프',
        description: '상위 180명의 채팅지수 통계를 그래프로 보여줍니다.(채팅지수 = (공백 문자 제외 글자 개수) / 채팅량)',
        options: [
            {
                name: '옵션',
                type: 'STRING',
                description: '-봇을 넣어주면 통계에서 봇을 제외하고 출력 (생략 시 봇 포함)'
            }
        ]
    },
    async commandExecute(interaction) {
        const option = interaction.options.getString('옵션');
        const targetGuild = (option && interaction.user.id === ADMIN_ID && client.guilds.cache.find((v) => v.name.includes(option))) || interaction.guild;
        if (!targetGuild) {
            return interaction.followUp('사용이 불가능한 채널입니다.');
        }

        return interaction.followUp({ files: [await getMessageStatGraph(targetGuild, option)] });
    }
};
