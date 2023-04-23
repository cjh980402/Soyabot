import { AttachmentBuilder, EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import { request } from 'undici';
import renderChart from '../util/chartjs_rendering.js';
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

async function getMesoEmbed(server) {
    const params = new URLSearchParams();
    params.set('term', '15d');
    const { body } = await request('https://commapi.gamemarket.kr/comm/graph', {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: params.toString()
    });
    const data = await body.json();
    const market = data.dbo ?? [];
    const direct = data.dbo2 ?? [];
    // 각각 배열, 길이는 15, 앞에서부터 과거 날짜

    const config = {
        type: 'line',
        data: {
            labels: market.map((v) => v.reg_date.slice(5, 10)),
            datasets: [
                {
                    label: '메소마켓(메포)',
                    data: market.map((v) => v[serverList[server]]),
                    lineTension: 0.4,
                    fill: false,
                    borderColor: 'rgb(153, 102, 255)',
                    borderWidth: 6,
                    pointBackgroundColor: 'rgb(153, 102, 255)',
                    pointRadius: 6
                },
                {
                    label: '무통거래(원)',
                    data: direct.map((v) => v[serverList[server]]),
                    lineTension: 0.4,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 6,
                    pointBackgroundColor: 'rgb(75, 192, 192)',
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
                    font: { size: 23 }
                },
                title: {
                    display: true,
                    font: { size: 26 },
                    text: `${server} 서버 메소시세`
                },
                legend: {
                    labels: { font: { size: 23 } }
                }
            },
            scales: {
                x: {
                    grid: { lineWidth: 3 },
                    ticks: { font: { size: 23 } }
                },
                y: {
                    grid: { lineWidth: 3 },
                    ticks: { font: { size: 23 } }
                }
            }
        }
    };

    const image = new AttachmentBuilder(await renderChart(config, 1200, 975), { name: 'meso.png' });
    const mesoEmbed = new EmbedBuilder()
        .setTitle(`**${server} 서버 메소 시세**`)
        .setColor('#FF9999')
        .setURL('https://talk.gamemarket.kr/maple/graph')
        .setImage('attachment://meso.png')
        .addFields([
            { name: '**메소마켓**', value: `${market.at(-1)?.[serverList[server]] ?? '-'}메포` },
            { name: '**무통거래**', value: `${direct.at(-1)?.[serverList[server]] ?? '-'}원` }
        ]);

    return { embeds: [mesoEmbed], files: [image] };
}

export const type = '메이플';
export const commandData = {
    name: '메소',
    description: '해당 서버의 메소 시세를 알려줍니다.',
    options: [
        {
            name: '서버',
            type: ApplicationCommandOptionType.String,
            description: '메소 시세를 검색할 서버',
            choices: Object.keys(serverList).map((v) => ({ name: v, value: v })),
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    await interaction.followUp(await getMesoEmbed(interaction.options.getString('서버')));
}
