import { ApplicationCommandOptionType } from 'discord.js';

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

    const total_req = [0, 0];
    const total_meso = [0, 0, 0, 0, 0, 0, 0];
    for (let i = startLev; i < endLev; i++) {
        total_req[0] += i * i + 11; // 요구량 = i^2 + 11
        total_meso[0] += 3110000 + 3960000 * i; // 여로 심볼
        total_meso[1] += 6220000 + 4620000 * i; // 츄츄 심볼
        total_meso[2] += 9330000 + 5280000 * i; // 레헬른 심볼
        total_meso[3] += 11196000 + 5940000 * i; // 아르카나, 모라스, 에스페라 심볼
        if (i < 11) {
            total_req[1] += 9 * i * i + 20 * i; // 요구량 = 9i^2 + 20i
            total_meso[4] += 96900000 + 88500000 * i; // 세르니움 심볼
            total_meso[5] += 106600000 + 97300000 * i; // 아르크스 심볼
            total_meso[6] += 117400000 + 107100000 * i; // 오디움 심볼
        }
    }

    await interaction.followUp(
        `아케인 심볼 Lv.${startLev} → Lv.${endLev}
요구량: ${total_req[0]}
여로: ${total_meso[0].toLocaleString()}메소
츄츄: ${total_meso[1].toLocaleString()}메소
레헬른: ${total_meso[2].toLocaleString()}메소
아르카나 이상: ${total_meso[3].toLocaleString()}메소

어센틱 심볼 Lv.${Math.min(11, startLev)} → Lv.${Math.min(11, endLev)}
요구량: ${total_req[1]}
세르니움: ${total_meso[4].toLocaleString()}메소
아르크스: ${total_meso[5].toLocaleString()}메소
오디움: ${total_meso[6].toLocaleString()}메소`
    );
}
