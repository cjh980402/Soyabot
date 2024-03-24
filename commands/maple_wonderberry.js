import { ApplicationCommandOptionType } from 'discord.js';
import { MapleProb } from '../util/maple_probtable.js';

export const type = '메이플';
export const commandData = {
    name: '원더베리',
    description: '원더베리 관련 기능을 수행합니다.',
    options: [
        {
            name: '확률',
            type: ApplicationCommandOptionType.Subcommand,
            description: '현재 원더베리의 확률을 보여줍니다.'
        },
        {
            name: '시뮬',
            type: ApplicationCommandOptionType.Subcommand,
            description: '1 ~ 20000 범위의 횟수를 입력하면 그만큼의 원더베리 시뮬을 수행합니다.',
            options: [
                {
                    name: '횟수',
                    type: ApplicationCommandOptionType.Integer,
                    min_value: 1,
                    max_value: 20000,
                    description: '원더베리 시뮬레이션 횟수'
                }
            ]
        }
    ]
};
export async function commandExecute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === '확률') {
        let rslt = '<원더베리 확률>';
        for (const key in MapleProb.WONDERBERRY_PROBTABLE) {
            rslt += `\n${key}: ${MapleProb.WONDERBERRY_PROBTABLE[key] / 10000000000}%`;
        }
        await interaction.followUp(rslt);
    } else if (subcommand === '시뮬') {
        const count = interaction.options.getInteger('횟수') ?? 1;

        // count는 원더베리 횟수
        // random은 0이상 1미만
        const list = {}; // 횟수 담을 객체
        const propsum = Object.values(MapleProb.WONDERBERRY_PROBTABLE).reduce((acc, cur) => acc + cur); // 확률표의 확률값의 합

        for (let i = 0; i < count; i++) {
            const now = Math.floor(Math.random() * propsum + 1);
            let sum = 0;
            for (const key in MapleProb.WONDERBERRY_PROBTABLE) {
                sum += MapleProb.WONDERBERRY_PROBTABLE[key];
                if (now <= sum) {
                    list[key] = (list[key] ?? 0) + 1;
                    break;
                }
            }
        }

        let rslt = `원더베리 ${count}회 결과\n`;
        for (const key in MapleProb.WONDERBERRY_PROBTABLE) {
            if (list[key]) {
                rslt += `\n${key}: ${list[key]}회`;
            }
        }
        await interaction.followUp(rslt);
    }
}
