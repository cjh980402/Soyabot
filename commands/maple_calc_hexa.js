import { ApplicationCommandOptionType } from 'discord.js';

const hexaConstant = [
    {
        data: [
            [5, 100],
            [1, 30],
            [1, 35],
            [1, 40],
            [2, 45],
            [2, 50],
            [2, 55],
            [3, 60],
            [3, 65],
            [10, 200],
            [3, 80],
            [3, 90],
            [4, 100],
            [4, 110],
            [4, 120],
            [4, 130],
            [4, 140],
            [4, 150],
            [5, 160],
            [15, 350],
            [5, 170],
            [5, 180],
            [5, 190],
            [5, 200],
            [5, 210],
            [6, 220],
            [6, 230],
            [6, 240],
            [7, 250],
            [20, 500]
        ],
        name: '스킬 코어'
    },
    {
        data: [
            [3, 50],
            [1, 15],
            [1, 18],
            [1, 20],
            [1, 23],
            [1, 25],
            [1, 28],
            [2, 30],
            [2, 33],
            [5, 100],
            [2, 40],
            [2, 45],
            [2, 50],
            [2, 55],
            [2, 60],
            [2, 65],
            [2, 70],
            [2, 75],
            [3, 80],
            [8, 175],
            [3, 85],
            [3, 90],
            [3, 95],
            [3, 100],
            [3, 105],
            [3, 110],
            [3, 115],
            [3, 120],
            [4, 125],
            [10, 250]
        ],
        name: '마스터리 코어(4차강화)'
    },
    {
        data: [
            [4, 75],
            [1, 23],
            [1, 27],
            [1, 30],
            [2, 34],
            [2, 38],
            [2, 42],
            [3, 45],
            [3, 49],
            [8, 150],
            [3, 60],
            [3, 68],
            [3, 75],
            [3, 83],
            [3, 90],
            [3, 98],
            [3, 105],
            [3, 113],
            [4, 120],
            [12, 263],
            [4, 128],
            [4, 135],
            [4, 143],
            [4, 150],
            [4, 158],
            [5, 165],
            [5, 173],
            [5, 180],
            [6, 188],
            [15, 375]
        ],
        name: '강화 코어(5차강화)'
    },
    {
        data: [
            [7, 125],
            [2, 38],
            [2, 44],
            [2, 50],
            [3, 57],
            [3, 63],
            [3, 69],
            [5, 75],
            [5, 82],
            [14, 300],
            [5, 110],
            [5, 124],
            [6, 138],
            [6, 152],
            [6, 165],
            [6, 179],
            [6, 193],
            [6, 207],
            [7, 220],
            [17, 525],
            [7, 234],
            [7, 248],
            [7, 262],
            [7, 275],
            [7, 289],
            [9, 303],
            [9, 317],
            [9, 330],
            [10, 344],
            [20, 750]
        ],
        name: '공용 코어'
    }
];
const hexaCount = hexaConstant.length;
const hexaMaxLev = 30;

export const type = '메이플';
export const commandData = {
    name: '6차',
    description: '시작 레벨부터 목표 레벨까지의 솔 에르다, 솔 에르다 조각의 요구 개수를 계산합니다.',
    options: [
        {
            name: '시작_레벨',
            type: ApplicationCommandOptionType.Integer,
            description: '6차 강화 정보를 계산할 시작 레벨',
            min_value: 0,
            max_value: hexaMaxLev,
            required: true
        },
        {
            name: '목표_레벨',
            type: ApplicationCommandOptionType.Integer,
            description: '6차 강화 정보를 계산할 목표 레벨',
            min_value: 0,
            max_value: hexaMaxLev,
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

    const totalReq = Array.from(Array(hexaCount), (_) => Array(2).fill(0));
    for (let i = startLev; i < endLev; i++) {
        for (let j = 0; j < hexaCount; j++) {
            totalReq[j][0] += hexaConstant[j].data[i][0];
            totalReq[j][1] += hexaConstant[j].data[i][1];
        }
    }

    let hexaResult = `6차스킬 Lv.${startLev} → Lv.${endLev}`;
    for (let i = 0; i < hexaCount; i++) {
        hexaResult += `\n${hexaConstant[i].name}: 솔 에르다 ${totalReq[i][0]}개, 솔 에르다 조각 ${totalReq[i][1]}개`;
    }

    await interaction.followUp(hexaResult);
}
