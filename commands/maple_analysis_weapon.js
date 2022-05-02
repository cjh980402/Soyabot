import { ApplicationCommandOptionType } from 'discord.js';

export const type = '메이플';
export const commandData = {
    name: '작분석',
    description: '무기의 작으로 상승한 공격력을 계산합니다.',
    options: [
        {
            name: '총_공격력',
            type: ApplicationCommandOptionType.Integer,
            description: '무기의 총 공격력 (기본공+파란색글씨+초록글씨)',
            required: true
        },
        {
            name: '기본공',
            type: ApplicationCommandOptionType.Integer,
            description: '무기의 기본 공격력(마력)',
            required: true
        },
        {
            name: '레벨_제한',
            type: ApplicationCommandOptionType.Integer,
            description: '130, 140, 150, 160, 200 중의 하나',
            choices: [130, 140, 150, 160, 200].map((v) => ({ name: v, value: v })),
            required: true
        },
        {
            name: '강화_단계',
            type: ApplicationCommandOptionType.Integer,
            description: '0 ~ 25성 사용가능 (130제는 20성까지)',
            required: true
        },
        {
            name: '추가_옵션',
            type: ApplicationCommandOptionType.Integer,
            description: '무기의 추옵 공격력 수치'
        }
    ]
};
export async function commandExecute(interaction) {
    let sum = interaction.options.getInteger('총_공격력');
    const base = interaction.options.getInteger('기본공');
    const level = interaction.options.getInteger('레벨_제한');
    const star = interaction.options.getInteger('강화_단계');
    const addoption = interaction.options.getInteger('추가_옵션') ?? 0;

    const starforce = {
        130: [6, 7, 7, 8, 9],
        140: [7, 8, 8, 9, 10, 11, 12, 30, 31, 32],
        150: [8, 9, 9, 10, 11, 12, 13, 31, 32, 33],
        160: [9, 9, 10, 11, 12, 13, 14, 32, 33, 34],
        200: [13, 13, 14, 14, 15, 16, 17, 34, 35, 36]
    };
    sum -= addoption; // 추옵 수치를 빼준다.
    if (!starforce[level]) {
        return interaction.followUp('130제, 140제, 150제, 160제, 200제 아이템만 가능합니다.');
    }
    if (level === 130 && star > 20) {
        return interaction.followUp('130제는 20성까지만 가능합니다.');
    }
    if (star < 0 || star > 25) {
        return interaction.followUp('강화 단계가 올바르지 않습니다.');
    }
    for (let i = star; i >= 1; i--) {
        sum -= i >= 16 ? starforce[level][i - 16] : Math.floor((sum + 50) / 51); // 스타포스 상승 수치를 없애는 과정
    }

    await interaction.followUp(`${level}제 ${star}성 강화\n작으로 상승한 공: ${sum - base}`);
}
