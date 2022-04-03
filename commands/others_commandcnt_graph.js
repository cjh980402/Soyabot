import { MessageAttachment } from 'discord.js';
import { PREFIX } from '../soyabot_config.js';
import renderChart from '../util/chartjs_rendering.js';

async function getCommandCountGraph(client) {
    const data = client.db.all('SELECT * FROM command_db ORDER BY count DESC'); // 내림차순
    const cmdColor = (a) =>
        data.map((v) => {
            const hash = [...v.name].reduce((acc, cur) => (31 * acc + cur.codePointAt(0)) | 0, 0); // 각 연산 후 signed 32-bit 정수로 변환
            let r = (hash >> 16) & 0xff;
            let g = (hash >> 8) & 0xff;
            let b = hash & 0xff;
            if (r >= 0xc8 && g >= 0xc8 && b >= 0xc8) {
                // 흰 색에 가까운 경우 어둡게 처리
                r %= 0xc8;
                g %= 0xc8;
                b %= 0xc8;
            }
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        });
    const height = Math.min(3000, 1200 + 20 * data.length);
    const size = Math.min(40, Math.floor((0.8 * (height - 120 - 3 * (data.length + 1))) / data.length));
    const config = {
        type: 'bar',
        data: {
            labels: data.map((v) => v.name),
            datasets: [
                {
                    label: '사용량',
                    data: data.map((v) => v.count),
                    backgroundColor: cmdColor(0.5),
                    borderColor: cmdColor(1),
                    borderWidth: 4,
                    maxBarThickness: 120
                }
            ]
        },
        options: {
            indexAxis: 'y', // Horizontal Bar Chart
            plugins: {
                datalabels: {
                    // 데이터 값 표시
                    color: 'black',
                    display: true,
                    anchor: 'end',
                    align: 'end',
                    font: { size }
                },
                title: {
                    display: true,
                    font: { size: 35 },
                    text: `${client.user.username}의 명령어 사용량 그래프`
                },
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { lineWidth: 3 },
                    ticks: {
                        font: { size: 30 },
                        beginAtZero: true // X축 0부터 시작하게 하는 옵션
                    }
                },
                y: {
                    grid: { lineWidth: 3 },
                    ticks: { font: { size } }
                }
            }
        }
    };

    return new MessageAttachment(await renderChart(config, 2000, height), 'chart.png');
}

export const usage = `${PREFIX}통계`;
export const command = ['통계', 'ㅌㄱ'];
export const description = '- 봇의 명령어 사용량 통계를 그래프로 보여줍니다.';
export const type = ['기타'];
export async function messageExecute(message) {
    return message.channel.send({ files: [await getCommandCountGraph(message.client)] });
}
export const commandData = {
    name: '통계',
    description: '봇의 명령어 사용량 통계를 그래프로 보여줍니다.'
};
export async function commandExecute(interaction) {
    return interaction.followUp({ files: [await getCommandCountGraph(interaction.client)] });
}
