import { PREFIX } from '../soyabot_config.js';

export const usage = `${PREFIX}심볼 (시작 레벨) (목표 레벨)`;
export const command = ['심볼', 'ㅅㅂ'];
export const description = `- 시작 레벨부터 목표 레벨까지의 심볼 요구갯수, 강화비용을 계산합니다.
- 현재심볼의 성장치는 고려하지 않습니다.
- 아케인 심볼은 1 ~ 20, 어센틱 심볼은 1 ~ 11 레벨입니다.`;
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length !== 2) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }

    const startlev = Math.trunc(args[0]),
        endlev = Math.trunc(args[1]);
    if (isNaN(startlev) || startlev < 1 || startlev > 20) {
        return message.channel.send('1 ~ 20 범위의 시작 레벨을 입력해주세요.');
    }
    if (isNaN(endlev) || endlev < startlev || endlev > 20) {
        return message.channel.send('시작 레벨 ~ 20 범위의 목표 레벨을 입력해주세요.');
    }

    const total_req = [0, 0];
    const total_meso = [0, 0, 0, 0, 0, 0];
    for (let i = startlev; i < endlev; i++) {
        total_req[0] += i * i + 11; // 요구량 = i^2 + 11
        total_meso[0] += 3110000 + 3960000 * i; // 여로 심볼
        total_meso[1] += 6220000 + 4620000 * i; // 츄츄 심볼
        total_meso[2] += 9330000 + 5280000 * i; // 레헬른 심볼
        total_meso[3] += 11196000 + 5940000 * i; // 아르카나, 모라스, 에스페라 심볼
        if (i < 11) {
            total_req[1] += 9 * i * i + 20 * i; // 요구량 = 9i^2 + 20i
            total_meso[4] += 96900000 + 88500000 * i; // 세르니움 심볼
            total_meso[5] += 106600000 + 97300000 * i; // 아르크스 심볼
        }
    }

    await message.channel.send(
        `아케인 심볼 Lv.${startlev} → Lv.${endlev}
요구량: ${total_req[0]}
여로: ${total_meso[0].toLocaleString()}메소
츄츄: ${total_meso[1].toLocaleString()}메소
레헬른: ${total_meso[2].toLocaleString()}메소
아르카나 이상: ${total_meso[3].toLocaleString()}메소

어센틱 심볼 Lv.${Math.min(11, startlev)} → Lv.${Math.min(11, endlev)}
요구량: ${total_req[1]}
세르니움: ${total_meso[4].toLocaleString()}메소
아르크스: ${total_meso[5].toLocaleString()}메소`
    );
}
export const commandData = {
    name: '심볼',
    description: '시작 레벨부터 목표 레벨까지의 심볼 요구갯수, 강화비용을 계산합니다.',
    options: [
        {
            name: '시작_레벨',
            type: 'INTEGER',
            description: '심볼 강화 정보를 계산할 시작 레벨',
            required: true,
            choices: [...Array(20)].map((_, i) => ({ name: i + 1, value: i + 1 }))
        },
        {
            name: '목표_레벨',
            type: 'INTEGER',
            description: '심볼 강화 정보를 계산할 목표 레벨',
            required: true,
            choices: [...Array(20)].map((_, i) => ({ name: i + 1, value: i + 1 }))
        }
    ]
};
export async function commandExecute(interaction) {
    const startlev = interaction.options.getInteger('시작_레벨');
    const endlev = interaction.options.getInteger('목표_레벨');
    if (endlev < startlev) {
        return interaction.followUp('시작 레벨 이상의 목표 레벨을 입력해주세요.');
    }

    const total_req = [0, 0];
    const total_meso = [0, 0, 0, 0, 0, 0];
    for (let i = startlev; i < endlev; i++) {
        total_req[0] += i * i + 11; // 요구량 = i^2 + 11
        total_meso[0] += 3110000 + 3960000 * i; // 여로 심볼
        total_meso[1] += 6220000 + 4620000 * i; // 츄츄 심볼
        total_meso[2] += 9330000 + 5280000 * i; // 레헬른 심볼
        total_meso[3] += 11196000 + 5940000 * i; // 아르카나, 모라스, 에스페라 심볼
        if (i < 11) {
            total_req[1] += 9 * i * i + 20 * i; // 요구량 = 9i^2 + 20i
            total_meso[4] += 96900000 + 88500000 * i; // 세르니움 심볼
            total_meso[5] += 106600000 + 97300000 * i; // 아르크스 심볼
        }
    }

    await interaction.followUp(
        `아케인 심볼 Lv.${startlev} → Lv.${endlev}
요구량: ${total_req[0]}
여로: ${total_meso[0].toLocaleString()}메소
츄츄: ${total_meso[1].toLocaleString()}메소
레헬른: ${total_meso[2].toLocaleString()}메소
아르카나 이상: ${total_meso[3].toLocaleString()}메소

어센틱 심볼 Lv.${Math.min(11, startlev)} → Lv.${Math.min(11, endlev)}
요구량: ${total_req[1]}
세르니움: ${total_meso[4].toLocaleString()}메소
아르크스: ${total_meso[5].toLocaleString()}메소`
    );
}
