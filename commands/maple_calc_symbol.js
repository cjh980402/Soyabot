import { ApplicationCommandOptionType } from 'discord.js';

const symbolConstant = [
    {
        default: 80000,
        diff: 1000,
        name: '소멸의 여로'
    },
    {
        default: 100000,
        diff: 1000,
        name: '츄츄 아일랜드'
    },
    {
        default: 120000,
        diff: 1000,
        name: '레헬른'
    },
    {
        default: 140000,
        diff: 1000,
        name: '아르카나'
    },
    {
        default: 160000,
        diff: 1000,
        name: '모라스'
    },
    {
        default: 180000,
        diff: 1000,
        name: '에스페라'
    },
    {
        default: 1320000,
        diff: -60000,
        name: '세르니움'
    },
    {
        default: 1500000,
        diff: -60000,
        name: '아르크스'
    },
    {
        default: 1680000,
        diff: -60000,
        name: '오디움'
    },
    {
        default: 1860000,
        diff: -60000,
        name: '도원경'
    },
    {
        default: 2040000,
        diff: -60000,
        name: '아르테리아'
    },
    {
        default: 2220000,
        diff: -60000,
        name: '카르시온'
    }
];
const arcaneCount = 6;
const authenticCount = 6;
const arcaneMaxLev = 20;
const authenticMaxLev = 11;

export const type = '메이플';
export const commandData = {
    name: '심볼',
    description: '시작 레벨부터 목표 레벨까지의 심볼 요구 개수, 강화비용을 계산합니다.',
    options: [
        {
            name: '시작_레벨',
            type: ApplicationCommandOptionType.Integer,
            description: '심볼 강화 정보를 계산할 시작 레벨',
            min_value: 1,
            max_value: arcaneMaxLev,
            required: true
        },
        {
            name: '목표_레벨',
            type: ApplicationCommandOptionType.Integer,
            description: '심볼 강화 정보를 계산할 목표 레벨',
            min_value: 1,
            max_value: arcaneMaxLev,
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
    const totalMeso = Array(arcaneCount + authenticCount).fill(0);
    for (let i = startLev; i < endLev; i++) {
        const arcaneReq = i * i + 11; // 요구량 = i^2 + 11
        totalReq[0] += arcaneReq;
        for (let j = 0, req = arcaneReq, div = 10000; j < arcaneCount; j++) {
            totalMeso[j] += Math.floor((req * (symbolConstant[j].default + i * symbolConstant[j].diff)) / div) * div;
        }

        if (i < authenticMaxLev) {
            const authenticReq = 9 * i * i + 20 * i; // 요구량 = 9i^2 + 20i
            totalReq[1] += authenticReq;
            for (let j = arcaneCount, req = authenticReq, div = 100000; j < arcaneCount + authenticCount; j++) {
                totalMeso[j] +=
                    Math.floor((req * (symbolConstant[j].default + i * symbolConstant[j].diff)) / div) * div;
            }
        }
    }

    let arcaneResult = `아케인 심볼 Lv.${startLev} → Lv.${endLev}
요구량: ${totalReq[0]}`;
    for (let i = 0; i < arcaneCount; i++) {
        arcaneResult += `\n${symbolConstant[i].name}: ${totalMeso[i].toLocaleString()}메소`;
    }
    let authenticResult = `어센틱 심볼 Lv.${Math.min(authenticMaxLev, startLev)} → Lv.${Math.min(
        authenticMaxLev,
        endLev
    )}
요구량: ${totalReq[1]}`;
    for (let i = arcaneCount; i < arcaneCount + authenticCount; i++) {
        authenticResult += `\n${symbolConstant[i].name}: ${totalMeso[i].toLocaleString()}메소`;
    }

    await interaction.followUp(`${arcaneResult}\n\n${authenticResult}`);
}
