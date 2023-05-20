import { ApplicationCommandOptionType } from 'discord.js';

const costConstant = [
    {
        default: 80000,
        diff: 1000
    },
    {
        default: 100000,
        diff: 1000
    },
    {
        default: 120000,
        diff: 1000
    },
    {
        default: 140000,
        diff: 1000
    },
    {
        default: 160000,
        diff: 1000
    },
    {
        default: 180000,
        diff: 1000
    },
    {
        default: 1320000,
        diff: -60000
    },
    {
        default: 1500000,
        diff: -60000
    },
    {
        default: 1680000,
        diff: -60000
    }
];

export const type = '메이플';
export const commandData = {
    name: '심볼',
    description: '시작 레벨부터 목표 레벨까지의 심볼 요구갯수, 강화비용을 계산합니다.',
    options: [
        {
            name: '시작_레벨',
            type: ApplicationCommandOptionType.Integer,
            description: '심볼 강화 정보를 계산할 시작 레벨',
            min_value: 1,
            max_value: 20,
            required: true
        },
        {
            name: '목표_레벨',
            type: ApplicationCommandOptionType.Integer,
            description: '심볼 강화 정보를 계산할 목표 레벨',
            min_value: 1,
            max_value: 20,
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const startLev = interaction.options.getInteger('시작_레벨');
    const endLev = interaction.options.getInteger('목표_레벨');
    if (endLev < startLev) {
        return interaction.followUp('시작 레벨 이상의 목표 레벨을 입력해주세요.');
    }

    const totalReq = [0, 0];
    const totalMeso = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = startLev; i < endLev; i++) {
        const arcaneReq = i * i + 11; // 요구량 = i^2 + 11
        totalReq[0] += arcaneReq;
        for (let j = 0, req = arcaneReq, div = 10000; j < 6; j++) {
            totalMeso[j] += Math.floor((req * (costConstant[j].default + i * costConstant[j].diff)) / div) * div;
        }

        if (i < 11) {
            const authenticReq = 9 * i * i + 20 * i; // 요구량 = 9i^2 + 20i
            totalReq[1] += authenticReq;
            for (let j = 6, req = authenticReq, div = 100000; j < 9; j++) {
                totalMeso[j] += Math.floor((req * (costConstant[j].default + i * costConstant[j].diff)) / div) * div;
            }
        }
    }

    await interaction.followUp(
        `아케인 심볼 Lv.${startLev} → Lv.${endLev}
요구량: ${totalReq[0]}
여로: ${totalMeso[0].toLocaleString()}메소
츄츄: ${totalMeso[1].toLocaleString()}메소
레헬른: ${totalMeso[2].toLocaleString()}메소
아르카나: ${totalMeso[3].toLocaleString()}메소
모라스: ${totalMeso[4].toLocaleString()}메소
에스페라: ${totalMeso[5].toLocaleString()}메소

어센틱 심볼 Lv.${Math.min(11, startLev)} → Lv.${Math.min(11, endLev)}
요구량: ${totalReq[1]}
세르니움: ${totalMeso[6].toLocaleString()}메소
아르크스: ${totalMeso[7].toLocaleString()}메소
오디움: ${totalMeso[8].toLocaleString()}메소`
    );
}
