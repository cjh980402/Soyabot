const renderChart = require('../util/chartjs_rendering');
const { MessageAttachment } = require('../util/discord.js-extend');
const { ADMIN_ID } = require('../soyabot_config.json');

module.exports = {
    usage: `${client.prefix}채팅지수그래프 (옵션)`,
    command: ['채팅지수그래프', 'ㅊㅌㅈㅅㄱㄹㅍ', 'ㅊㅌㅈㅅㄱㄿ'],
    description: `- 상위 180명의 채팅지수 통계를 그래프로 보여줍니다.
- 옵션에 -봇을 넣어주면 통계에서 봇을 제외하고 보여줍니다. (생략 시 봇 포함)
- 채팅지수 = (공백 문자 제외 글자 개수) / 채팅량`,
    type: ['기타'],
    async execute(message, args) {
        const targetChannel = (args.length > 0 && message.author.id === ADMIN_ID && client.guilds.cache.find((v) => v.name.includes(args.join(' ')))) || message.guild;
        if (!targetChannel) {
            return message.channel.send('사용이 불가능한 채널입니다.');
        }

        const roommessage = (
            await (
                await db.all('SELECT * FROM messagedb WHERE channelsenderid LIKE ?', [`${targetChannel.id}%`])
            ).asyncFilter(async (v) => {
                try {
                    const senderid = v.channelsenderid.split(' ')[1];
                    v.member = await targetChannel.members.fetch(senderid, false);
                    return v.member && (args[0] !== '-봇' || !v.member.user.bot);
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
                    text: `${targetChannel.name} 방의 채팅지수 그래프`
                },
                legend: { display: false }
            }
        };

        const attachment = new MessageAttachment(await renderChart(config, 2000, height), 'chart.png');
        return message.channel.send({ files: [attachment] });
    }
};
