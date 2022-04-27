import { ApplicationCommandOptionType } from 'discord.js';
import { levelTable } from '../util/Constant.js';
const probTable = [
    [5, 5, 5, 5, 5, 5, 10, 20, 20, 20],
    [5, 5, 5, 5, 5, 10, 10, 20, 20, 15],
    [5, 5, 5, 5, 5, 10, 20, 15, 15, 15],
    [5, 5, 5, 5, 5, 20, 10, 15, 15, 15],
    [5, 5, 5, 10, 10, 10, 10, 15, 15, 15],
    [5, 5, 5, 10, 10, 10, 15, 15, 15, 10],
    [5, 5, 5, 10, 10, 15, 15, 15, 10, 10],
    [5, 5, 5, 10, 15, 15, 15, 10, 10, 10],
    [5, 5, 10, 10, 15, 10, 15, 10, 10, 10],
    [5, 5, 10, 15, 10, 15, 10, 10, 10, 10],
    [5, 5, 10, 10, 15, 20, 10, 10, 10, 5],
    [5, 5, 10, 10, 20, 15, 15, 10, 5, 5],
    [5, 5, 10, 15, 15, 20, 10, 10, 5, 5],
    [5, 5, 10, 20, 20, 10, 10, 10, 5, 5],
    [5, 10, 10, 20, 15, 10, 10, 10, 5, 5],
    [10, 10, 10, 15, 15, 10, 10, 10, 5, 5],
    [10, 10, 15, 15, 10, 10, 10, 10, 5, 5],
    [10, 15, 15, 10, 10, 10, 10, 10, 5, 5],
    [15, 20, 5, 10, 10, 10, 10, 10, 5, 5],
    [15, 10, 15, 15, 10, 10, 10, 5, 5, 5],
    [15, 15, 15, 10, 10, 10, 10, 5, 5, 5],
    [20, 15, 10, 10, 10, 10, 10, 5, 5, 5],
    [15, 20, 15, 10, 10, 10, 5, 5, 5, 5],
    [20, 20, 10, 10, 10, 10, 5, 5, 5, 5],
    [20, 20, 15, 10, 10, 5, 5, 5, 5, 5],
    [20, 15, 15, 15, 10, 10, 5, 5, 5, 0],
    [20, 20, 15, 10, 10, 10, 5, 5, 5, 0],
    [20, 25, 10, 10, 10, 10, 5, 5, 5, 0],
    [25, 20, 10, 10, 10, 10, 5, 5, 5, 0],
    [25, 20, 15, 10, 10, 5, 5, 5, 5, 0],
    [25, 20, 10, 15, 10, 10, 5, 5, 0, 0],
    [25, 20, 15, 15, 10, 5, 5, 5, 0, 0],
    [25, 25, 15, 10, 10, 5, 5, 5, 0, 0],
    [25, 30, 10, 10, 10, 5, 5, 5, 0, 0],
    [30, 20, 20, 10, 5, 5, 5, 5, 0, 0],
    [25, 20, 25, 10, 10, 5, 5, 0, 0, 0],
    [30, 20, 20, 10, 10, 5, 5, 0, 0, 0],
    [30, 25, 15, 10, 10, 5, 5, 0, 0, 0],
    [30, 25, 20, 10, 5, 5, 5, 0, 0, 0],
    [35, 25, 20, 5, 5, 5, 5, 0, 0, 0],
    [35, 30, 15, 10, 5, 5, 0, 0, 0, 0],
    [35, 35, 15, 5, 5, 5, 0, 0, 0, 0],
    [40, 35, 10, 5, 5, 5, 0, 0, 0, 0],
    [50, 25, 10, 5, 5, 5, 0, 0, 0, 0],
    [55, 25, 5, 5, 5, 5, 0, 0, 0, 0],
    [50, 30, 10, 5, 5, 0, 0, 0, 0, 0],
    [50, 35, 5, 5, 5, 0, 0, 0, 0, 0],
    [60, 25, 5, 5, 5, 0, 0, 0, 0, 0],
    [60, 25, 10, 5, 0, 0, 0, 0, 0, 0],
    [55, 35, 10, 0, 0, 0, 0, 0, 0, 0],
    [60, 35, 5, 0, 0, 0, 0, 0, 0, 0],
    [65, 30, 5, 0, 0, 0, 0, 0, 0, 0],
    [65, 35, 0, 0, 0, 0, 0, 0, 0, 0],
    [75, 25, 0, 0, 0, 0, 0, 0, 0, 0],
    [80, 20, 0, 0, 0, 0, 0, 0, 0, 0],
    [85, 15, 0, 0, 0, 0, 0, 0, 0, 0],
    [90, 10, 0, 0, 0, 0, 0, 0, 0, 0],
    [95, 5, 0, 0, 0, 0, 0, 0, 0, 0],
    [100, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

function extremePotion(startLev, endLev) {
    let rslt = '',
        cnt = 0;

    for (let lev = startLev; lev < endLev; cnt++) {
        const now = Math.floor(Math.random() * 100 + 1);
        let sum = 0,
            i = 0;
        for (i = 0; i < 10; i++) {
            sum += probTable[lev - 141][i];
            if (now <= sum) {
                break;
            }
        }
        rslt += `${lev}레벨 → ${(lev += i + 1)}레벨 (${i + 1}레벨 상승)\n`;
    }
    return `${rslt}총 ${cnt}개의 익성비를 소모`;
}

export const type = ['메이플'];
export const commandData = {
    name: '익성비',
    description: '익성비 관련 기능을 수행합니다.',
    options: [
        {
            name: '확률',
            type: ApplicationCommandOptionType.Subcommand,
            description: '입력 레벨에 해당하는 익성비의 확률을 보여줍니다.',
            options: [
                {
                    name: '대상_레벨',
                    type: ApplicationCommandOptionType.Integer,
                    description: '익성비 확률을 출력할 레벨',
                    min_value: 141,
                    max_value: 199,
                    required: true
                }
            ]
        },
        {
            name: '시뮬',
            type: ApplicationCommandOptionType.Subcommand,
            description:
                '시작 레벨 ~ 목표 레벨의 익성비 시뮬레이션을 수행합니다. 200레벨 이상의 경우는 시작 레벨만 입력해주세요.',
            options: [
                {
                    name: '시작_레벨',
                    type: ApplicationCommandOptionType.Integer,
                    description: '익성비 시뮬의 시작 레벨',
                    min_value: 141,
                    max_value: 299,
                    required: true
                },
                {
                    name: '목표_레벨',
                    type: ApplicationCommandOptionType.Integer,
                    description: '익성비 시뮬의 목표 레벨',
                    min_value: 141,
                    max_value: 200
                }
            ]
        }
    ]
};
export async function commandExecute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === '확률') {
        const targetLev = interaction.options.getInteger('대상_레벨');

        let rslt = `<${targetLev}레벨 기준 확률>`;
        for (let i = 0; i < 10; i++) {
            rslt += `\n${i + 1} 레벨업 확률: ${probTable[targetLev - 141][i]}%`;
        }
        await interaction.followUp(rslt);
    } else if (subcommand === '시뮬') {
        const startLev = interaction.options.getInteger('시작_레벨');
        const endLev = interaction.options.getInteger('목표_레벨');

        if (endLev) {
            if (endLev < startLev) {
                return interaction.followUp('시작 레벨의 이상의 값으로 목표 레벨을 입력해주세요.');
            }
            await interaction.followUp(extremePotion(startLev, endLev));
        } else {
            if (startLev < 200) {
                return interaction.followUp('200 ~ 299 범위의 시작 레벨을 입력해주세요.');
            }
            const exp199 = levelTable[199] - levelTable[198];
            const expNow = levelTable[startLev] - levelTable[startLev - 1];
            await interaction.followUp(`Lv.${startLev} 익성비 효과\n경험치: ${((exp199 / expNow) * 100).toFixed(3)}%`);
        }
    }
}
