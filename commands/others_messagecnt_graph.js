const { MessageAttachment } = require("discord.js");
const QuickChart = require('quickchart-js');
const { ADMIN_ID } = require("../soyabot_config.json");

module.exports = {
    usage: `${client.prefix}채팅량그래프 (옵션)`,
    command: ["채팅량그래프", "ㅊㅌㄹㄱㄹㅍ", "ㅊㅌㄹㄱㄿ", "ㅊㅌㄺㄿ"],
    description: `- 전체 사용자의 채팅량 통계를 그래프로 보여줍니다.
- 옵션을 생략시 전체 사용자, -봇을 넣어주면 통계에서 봇을 제외하고 보여줍니다.`,
    type: ["기타"],
    async execute(message, args) {
        const targetChannel = (message.author.id == ADMIN_ID && args.length > 0
            && client.guilds.cache.find(v => v.name.includes(args.join(" ")))) || message.guild;
        if (!targetChannel) {
            return message.channel.send("사용이 불가능한 채널입니다.");
        }

        const roommessage = (await db.all(`SELECT * FROM messagedb WHERE channelsenderid LIKE ?`, [`${targetChannel.id}%`])).filter(v => {
            const member = targetChannel.members.cache.get(v.channelsenderid.split(' ')[1]);
            return member && (args[0] != "-봇" || !member.user.bot);
        }).sort((a, b) => (b.messagecnt - a.messagecnt)); // 내림차순
        const usercolor = roommessage.map(v => {
            const color = v.channelsenderid.split(' ')[1] & 0xFFFFFF;
            let r = (color >> 16) & 0xFF;
            let g = (color >> 8) & 0xFF;
            let b = color & 0xFF;
            if (r >= 0xC8 && g >= 0xC8 && b >= 0xC8) { // 흰 색에 가까운 경우 어둡게 처리
                r %= 0xC8;
                g %= 0xC8;
                b %= 0xC8;
            }
            return `rgba(${r}, ${g}, ${b}`;
        });
        const height = Math.min(3000, 1200 + 20 * roommessage.length);
        const size = Math.min(40, Math.floor(0.85 * (height - 120 - 3 * (roommessage.length + 1)) / roommessage.length));
        const messageChart = new QuickChart();
        messageChart
            .setConfig({
                type: 'horizontalBar',
                data: {
                    labels: roommessage.map(v => {
                        const member = targetChannel.members.cache.get(v.channelsenderid.split(' ')[1]);
                        return member.nickname ?? member.user.username;
                    }),
                    datasets: [{
                        label: '채팅량',
                        data: roommessage.map(v => v.messagecnt),
                        backgroundColor: usercolor.map(v => `${v}, 0.5)`),
                        borderColor: usercolor.map(v => `${v}, 1)`),
                        borderWidth: 4,
                        maxBarThickness: 120
                    }]
                },
                options: {
                    plugins: {
                        datalabels: { // 데이터 값 표시
                            color: 'black',
                            display: true,
                            anchor: 'end',
                            align: 'end',
                            font: {
                                size: size
                            }
                        }
                    },
                    scales: {
                        xAxes: [{
                            gridLines: { lineWidth: 3 },
                            ticks: { fontSize: 30, beginAtZero: true }
                        }], // X축 0부터 시작하게 하는 옵션
                        yAxes: [{
                            gridLines: { lineWidth: 3 },
                            ticks: { fontSize: size }
                        }]
                    },
                    title: {
                        display: true,
                        fontSize: 35,
                        text: `${targetChannel.name} 방의 채팅량 그래프`
                    },
                    legend: { display: false }
                }
            })
            .setWidth(2000)
            .setHeight(height)
            .setBackgroundColor('white');

        const attachment = new MessageAttachment(await messageChart.toBinary());
        return message.channel.send({
            files: [attachment]
        });
    }
};