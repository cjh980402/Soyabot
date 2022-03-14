import { PREFIX } from '../soyabot_config.js';
import { MapleProb } from '../util/maple_probtable.js';

export const usage = `${PREFIX}성형 (성별) (목표 성형 이름)`;
export const command = ['성형', 'ㅅㅎ'];
export const description = `- 해당 성별의 목표 성형을 얻을 때까지 로얄 성형 시뮬을 수행합니다.
- 적용 중인 성형이 목록에 존재할 경우 나머지 성형만 뜹니다.(처음 성형은 목록에 없다 가정)
- 참고. ${PREFIX}성형 확률`;
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length === 1 && (args[0] === '확률' || args[0] === 'ㅎㄹ')) {
        const rslt = `<로얄 성형 확률>\n\n- 남자 성형\n${MapleProb.ROYALFACE_PROBTABLE['남']
            .map((v) => `${v}: 16.67%`)
            .join('\n')}\n\n- 여자 성형\n${MapleProb.ROYALFACE_PROBTABLE['여'].map((v) => `${v}: 16.67%`).join('\n')}`;
        return message.channel.send(rslt);
    }
    if (args.length < 2) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }
    const gender = args.shift()[0];
    const goalface = (MapleProb.ROYALFACE_PROBTABLE[gender] ?? []).findIndex((v) =>
        v.replace(/\s+/, '').includes(args.join(''))
    );
    if (goalface === -1) {
        return message.channel.send(
            `**${usage}**\n현재 로얄 성형의 시뮬레이션만 수행할 수 있습니다.\n남: ${MapleProb.ROYALFACE_PROBTABLE[
                '남'
            ].join(', ')}\n여: ${MapleProb.ROYALFACE_PROBTABLE['여'].join(', ')}`
        );
    }
    // gender은 성별, goalface는 목표 성형의 인덱스
    // random은 0이상 1미만
    const list = []; // 진행 과정 담을 배열 (인덱스 저장)

    while (list.at(-1) !== goalface) {
        // 목표 성형을 띄웠으면 종료
        const now = Math.floor(Math.random() * (MapleProb.ROYALFACE_PROBTABLE[gender].length - +(list.length > 0)));
        list.push(now + +(list.at(-1) <= now)); // 현재 뜬 성형의 인덱스 저장, now 뒤에 더하는 이유는 최근 성형 제외 목적
    }

    const rslt = `로얄 성형 (목표: ${MapleProb.ROYALFACE_PROBTABLE[gender][goalface]}) 결과\n\n수행 횟수: ${
        list.length
    }회\n\n진행 과정\n${list.map((v, i) => `${i + 1}번째: ${MapleProb.ROYALFACE_PROBTABLE[gender][v]}`).join('\n')}`;
    return message.channel.send(rslt);
}
export const commandData = {
    name: '성형',
    description: '로얄 성형 관련 기능을 수행합니다.',
    options: [
        {
            name: '확률',
            type: 'SUB_COMMAND',
            description: '현재 로얄 성형의 확률을 보여줍니다.'
        },
        {
            name: '남',
            type: 'SUB_COMMAND',
            description: '남자 캐릭터의 성형 시뮬레이션을 수행합니다.',
            options: [
                {
                    name: '목표_성형_이름',
                    type: 'STRING',
                    description: '시뮬레이션의 목표 성형',
                    required: true
                }
            ]
        },
        {
            name: '여',
            type: 'SUB_COMMAND',
            description: '여자 캐릭터의 성형 시뮬레이션을 수행합니다.',
            options: [
                {
                    name: '목표_성형_이름',
                    type: 'STRING',
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
        return interaction.followUp(rslt);
    }
}
