import { ApplicationCommandOptionType } from 'discord.js';
import { MapleProb } from '../util/maple_probtable.js';

export const type = ['메이플'];
export const commandData = {
    name: '루나크리스탈',
    description: '루나크리스탈 관련 기능을 수행합니다.',
    options: [
        {
            name: '확률',
            type: ApplicationCommandOptionType.Subcommand,
            description: '현재 루나크리스탈의 확률을 보여줍니다.',
            options: [
                {
                    name: '카테고리',
                    type: ApplicationCommandOptionType.String,
                    description: '확률을 출력할 루나크리스탈 카테고리',
                    choices: Object.keys(MapleProb.LUNACRYSTAL_PROBTABLE).map((v) => ({ name: v, value: v })),
                    required: true
                }
            ]
        },
        {
            name: '시뮬',
            type: ApplicationCommandOptionType.Subcommand,
            description: '1 ~ 20000 범위의 횟수를 입력하면 그만큼의 루나크리스탈 시뮬을 수행합니다.',
            options: [
                {
                    name: '카테고리',
                    type: ApplicationCommandOptionType.String,
                    description: '시뮬레이션을 수행할 루나크리스탈 카테고리',
                    choices: Object.keys(MapleProb.LUNACRYSTAL_PROBTABLE).map((v) => ({ name: v, value: v })),
                    required: true
                },
                {
                    name: '횟수',
                    type: ApplicationCommandOptionType.Integer,
                    min_value: 1,
                    max_value: 20000,
                    description: '루나크리스탈 시뮬레이션 횟수'
                }
            ]
        }
    ]
};
export async function commandExecute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const category = interaction.options.getString('카테고리');

    if (subcommand === '확률') {
        let rslt = `<루나크리스탈 ${category} 확률>`;
        for (const key in MapleProb.LUNACRYSTAL_PROBTABLE[category]) {
            rslt += `\n${key}: ${MapleProb.LUNACRYSTAL_PROBTABLE[category][key] / 100}%`;
        }
        await interaction.followUp(rslt);
    } else if (subcommand === '시뮬') {
        const count = interaction.options.getInteger('횟수') ?? 1;

        // category는 루나크리스탈 종류, count는 루나크리스탈 횟수
        // random은 0이상 1미만
        const list = {}; // 횟수 담을 객체
        const probSum = Object.values(MapleProb.LUNACRYSTAL_PROBTABLE[category]).reduce((acc, cur) => acc + cur); // 확률표의 확률값의 합

        for (let i = 0; i < count; i++) {
            const now = Math.floor(Math.random() * probSum + 1);
            let sum = 0;
            for (const key in MapleProb.LUNACRYSTAL_PROBTABLE[category]) {
                sum += MapleProb.LUNACRYSTAL_PROBTABLE[category][key];
                if (now <= sum) {
                    list[key] = (list[key] ?? 0) + 1;
                    break;
                }
            }
        }

        let rslt = `루나크리스탈 ${category} ${count}회 결과\n`;
        for (const key in MapleProb.LUNACRYSTAL_PROBTABLE[category]) {
            if (list[key]) {
                rslt += `\n${key}: ${list[key]}회`;
            }
        }
        await interaction.followUp(rslt);
    }
}
