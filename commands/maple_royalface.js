import { ApplicationCommandOptionType } from 'discord.js';
import { MapleProb } from '../util/maple_probtable.js';

export const type = '메이플';
export const commandData = {
    name: '성형',
    description: '로얄 성형 관련 기능을 수행합니다.',
    options: [
        {
            name: '확률',
            type: ApplicationCommandOptionType.Subcommand,
            description: '현재 로얄 성형의 확률을 보여줍니다.'
        },
        {
            name: '남',
            type: ApplicationCommandOptionType.Subcommand,
            description: '남자 캐릭터의 성형 시뮬레이션을 수행합니다.',
            options: [
                {
                    name: '목표_성형_이름',
                    type: ApplicationCommandOptionType.String,
                    description: '시뮬레이션의 목표 성형',
                    required: true
                }
            ]
        },
        {
            name: '여',
            type: ApplicationCommandOptionType.Subcommand,
            description: '여자 캐릭터의 성형 시뮬레이션을 수행합니다.',
            options: [
                {
                    name: '목표_성형_이름',
                    type: ApplicationCommandOptionType.String,
                    description: '시뮬레이션의 목표 성형',
                    required: true
                }
            ]
        }
    ]
};
export async function commandExecute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === '확률') {
        const rslt = `<로얄 성형 확률>\n\n- 남자 성형\n${MapleProb.ROYALFACE_PROBTABLE['남']
            .map((v) => `${v}: 16.67%`)
            .join('\n')}\n\n- 여자 성형\n${MapleProb.ROYALFACE_PROBTABLE['여'].map((v) => `${v}: 16.67%`).join('\n')}`;
        return interaction.followUp(rslt);
    } else {
        const goalface = MapleProb.ROYALFACE_PROBTABLE[subcommand].findIndex((v) =>
            v.replace(/\s+/, '').includes(interaction.options.getString('목표_성형_이름'))
        );
        if (goalface === -1) {
            return interaction.followUp(
                `**${usage}**\n현재 로얄 성형의 시뮬레이션만 수행할 수 있습니다.\n남: ${MapleProb.ROYALFACE_PROBTABLE[
                    '남'
                ].join(', ')}\n여: ${MapleProb.ROYALFACE_PROBTABLE['여'].join(', ')}`
            );
        }
        // subcommand은 성별, goalface는 목표 성형의 인덱스
        // random은 0이상 1미만
        const list = []; // 진행 과정 담을 배열 (인덱스 저장)

        while (list.at(-1) !== goalface) {
            // 목표 성형을 띄웠으면 종료
            const now = Math.floor(
                Math.random() * (MapleProb.ROYALFACE_PROBTABLE[subcommand].length - +(list.length > 0))
            );
            list.push(now + +(list.at(-1) <= now)); // 현재 뜬 성형의 인덱스 저장, now 뒤에 더하는 이유는 최근 성형 제외 목적
        }

        const rslt = `로얄 성형 (목표: ${MapleProb.ROYALFACE_PROBTABLE[subcommand][goalface]}) 결과\n\n수행 횟수: ${
            list.length
        }회\n\n진행 과정\n${list
            .map((v, i) => `${i + 1}번째: ${MapleProb.ROYALFACE_PROBTABLE[subcommand][v]}`)
            .join('\n')}`;
        await interaction.followUp(rslt);
    }
}
