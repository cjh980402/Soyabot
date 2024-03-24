import { ApplicationCommandOptionType } from 'discord.js';
import { MapleProb } from '../util/maple_probtable.js';
import { sendSplitCode } from '../util/soyabot_util.js';

export const type = '메이플';
export const commandData = {
    name: '골드애플',
    description: '골드애플 관련 기능을 수행합니다.',
    options: [
        {
            name: '확률',
            type: ApplicationCommandOptionType.Subcommand,
            description: '현재 골드애플의 확률을 보여줍니다.'
        },
        {
            name: '시뮬',
            type: ApplicationCommandOptionType.Subcommand,
            description: '1 ~ 20000 범위의 횟수를 입력하면 그만큼의 골드애플 시뮬을 수행합니다.',
            options: [
                {
                    name: '횟수',
                    type: ApplicationCommandOptionType.Integer,
                    min_value: 1,
                    max_value: 20000,
                    description: '골드애플 시뮬레이션 횟수'
                }
            ]
        }
    ]
};
export async function commandExecute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === '확률') {
        let rslt = `<골드애플 확률>`;
        for (const key in MapleProb.GOLDAPPLE_PROBTABLE) {
            rslt += `\n${key}: ${MapleProb.GOLDAPPLE_PROBTABLE[key] / 10000000000}%`;
        }
        await sendSplitCode(interaction, rslt, { split: true });
    } else if (subcommand === '시뮬') {
        const count = interaction.options.getInteger('횟수') ?? 1;

        // count는 골드애플 횟수
        // random은 0이상 1미만
        const list = {}; // 횟수 담을 객체
        const probSum = Object.values(MapleProb.GOLDAPPLE_PROBTABLE).reduce((acc, cur) => acc + cur); // 확률표의 확률값의 합

        for (let i = 0; i < count; i++) {
            const now = Math.floor(Math.random() * probSum + 1);
            let sum = 0;
            for (const key in MapleProb.GOLDAPPLE_PROBTABLE) {
                sum += MapleProb.GOLDAPPLE_PROBTABLE[key];
                if (now <= sum) {
                    list[key] = (list[key] ?? 0) + 1;
                    break;
                }
            }
        }

        let rslt = `골드애플 ${count}회 결과\n`;
        for (const key in MapleProb.GOLDAPPLE_PROBTABLE) {
            if (list[key]) {
                rslt += `\n${key}: ${list[key]}회`;
            }
        }
        await sendSplitCode(interaction, rslt, { split: true });
    }
}
