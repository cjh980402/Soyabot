import { AttachmentBuilder } from 'discord.js';
import renderChart from '../util/chartjs_rendering.js';
import { getYoutubeStatisticsCountLimit } from '../util/song_util.js';

async function getSongCountGraph(client) {
    const data = await getYoutubeStatisticsCountLimit(50);
    const songColor = (a) =>
        data.map((v) => {
            const hash = [...v.artist].reduce((acc, cur) => (31 * acc + cur.codePointAt(0)) | 0, 0); // 각 연산 후 signed 32-bit 정수로 변환
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
            labels: data.map((v) => v.song),
            datasets: [
                {
                    label: '재생 횟수',
                    data: data.map((v) => v.count),
                    backgroundColor: songColor(0.5),
                    borderColor: songColor(1),
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
                    text: `${client.user.username}의 노래 통계 그래프`
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

    return new AttachmentBuilder(await renderChart(config, 2000, height), { name: 'chart.png' });
}

export const type = '음악';
export const commandData = {
    name: 'chart',
    description: '봇의 노래 통계 상위 50곡을 그래프로 보여줍니다.'
};
export async function commandExecute(interaction) {
    await interaction.followUp({ files: [await getSongCountGraph(interaction.client)] });
}
