import { ApplicationCommandOptionType } from 'discord.js';
import { levelTable } from '../util/Constant.js';
import { Util } from '../util/Util.js';

export const type = ['메이플'];
export const commandData = {
    name: '경험치',
    description:
        '시작 레벨에서 끝 레벨을 달성할 때까지의 경험치통과 끝 레벨 기준 누적 경험치 비율, 끝 레벨을 생략 시 시작 레벨의 경험치통과 누적 경험치 비율을 계산합니다.',
    options: [
        {
            name: '시작_레벨',
            type: ApplicationCommandOptionType.Integer,
            description: '경험치 정보를 계산할 시작 레벨',
            min_value: 1,
            max_value: 300,
            required: true
        },
        {
            name: '끝_레벨',
            type: ApplicationCommandOptionType.Integer,
            description: '경험치 정보를 계산할 끝 레벨',
            min_value: 1,
            max_value: 300
        }
    ]
};
export async function commandExecute(interaction) {
    const startLev = interaction.options.getInteger('시작_레벨');
    const endLev = interaction.options.getInteger('끝_레벨');

    if (endLev) {
        if (endLev < startLev) {
            return interaction.followUp('시작 레벨 ~ 300 범위의 끝 레벨을 입력해주세요.');
        }

        const rslt = `Lv.${startLev} → Lv.${endLev} 경험치통: ${(
            levelTable[endLev - 1] - levelTable[startLev - 1]
        ).toLocaleString()}
(${Util.toUnitString(levelTable[endLev - 1] - levelTable[startLev - 1])})
진행률 (~250): ${(Math.min(levelTable[endLev - 1] / levelTable[249], 1) * 100).toFixed(3)}%
진행률 (~275): ${(Math.min(levelTable[endLev - 1] / levelTable[274], 1) * 100).toFixed(3)}%
진행률 (~300): ${((levelTable[endLev - 1] / levelTable[299]) * 100).toFixed(3)}%`;
        await interaction.followUp(rslt);
    } else {
        const rslt = `Lv.${startLev} 경험치통: ${(levelTable[startLev] - levelTable[startLev - 1]).toLocaleString()}
(${Util.toUnitString(levelTable[startLev] - levelTable[startLev - 1])})
진행률 (~250): ${(Math.min(levelTable[startLev - 1] / levelTable[249], 1) * 100).toFixed(3)}%
진행률 (~275): ${(Math.min(levelTable[startLev - 1] / levelTable[274], 1) * 100).toFixed(3)}%
진행률 (~300): ${((levelTable[startLev - 1] / levelTable[299]) * 100).toFixed(3)}%`;
        await interaction.followUp(rslt);
    }
}
