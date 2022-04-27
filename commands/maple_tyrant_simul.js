import { ApplicationCommandOptionType } from 'discord.js';
import { SuperialItem } from '../classes/SuperialItem.js';

export const type = ['메이플'];
export const commandData = {
    name: '타일런트시뮬',
    description: '타일런트 장비템의 스타포스 시뮬레이션을 수행합니다.',
    options: [
        {
            name: '시작_스타포스_개수',
            type: ApplicationCommandOptionType.Integer,
            description: '시뮬레이션 시작 스타포스 개수',
            min_value: 0,
            max_value: 14,
            required: true
        },
        {
            name: '목표_스타포스_개수',
            type: ApplicationCommandOptionType.Integer,
            description: '시뮬레이션 목표 스타포스 개수',
            min_value: 0,
            max_value: 14,
            required: true
        },
        {
            name: '스타캐치',
            type: ApplicationCommandOptionType.Integer,
            description: '스타캐치 적용 유무',
            choices: [
                { name: '스타캐치 미적용', value: 0 },
                { name: '스타캐치 적용', value: 1 }
            ]
        }
    ]
};
export async function commandExecute(interaction) {
    const result = new SuperialItem();
    await interaction.followUp(
        result.doingStarforce([
            interaction.options.getInteger('시작_스타포스_개수'),
            interaction.options.getInteger('목표_스타포스_개수'),
            interaction.options.getInteger('스타캐치') ?? 1
        ])
    );
}
