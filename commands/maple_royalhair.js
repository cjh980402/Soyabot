import { PREFIX } from '../soyabot_config.js';
import { MapleProb } from '../util/maple_probtable.js';

export const usage = `${PREFIX}헤어 (성별) (목표 헤어 이름)`;
export const command = ['헤어', 'ㅎㅇ'];
export const description = `- 해당 성별의 목표 헤어를 얻을 때까지 로얄 헤어 시뮬을 수행합니다.
- 적용 중인 헤어가 목록에 존재할 경우 나머지 헤어만 뜹니다.(처음 헤어는 목록에 없다 가정)
- 참고. ${PREFIX}헤어 확률`;
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length === 1 && (args[0] === '확률' || args[0] === 'ㅎㄹ')) {
        const rslt = `<로얄 헤어 확률>\n\n- 남자 헤어\n${MapleProb.ROYALHAIR_PROBTABLE['남']
            .map((v) => `${v}: 16.67%`)
            .join('\n')}\n\n- 여자 헤어\n${MapleProb.ROYALHAIR_PROBTABLE['여'].map((v) => `${v}: 16.67%`).join('\n')}`;
        return message.channel.send(rslt);
    }
    if (args.length < 2) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }
    const gender = args.shift()[0];
    const goalhair = (MapleProb.ROYALHAIR_PROBTABLE[gender] ?? []).findIndex((v) =>
        v.replace(/\s+/, '').includes(args.join(''))
    );
    if (goalhair === -1) {
        return message.channel.send(
            `**${usage}**\n현재 로얄 헤어의 시뮬레이션만 수행할 수 있습니다.\n남: ${MapleProb.ROYALHAIR_PROBTABLE[
                '남'
            ].join(', ')}\n여: ${MapleProb.ROYALHAIR_PROBTABLE['여'].join(', ')}`
        );
    }
    // gender은 성별, goalhair는 목표 헤어의 인덱스
    // random은 0이상 1미만
    const list = []; // 진행 과정 담을 배열 (인덱스 저장)

    while (list.at(-1) !== goalhair) {
        // 목표 헤어을 띄웠으면 종료
        const now = Math.floor(Math.random() * (MapleProb.ROYALHAIR_PROBTABLE[gender].length - +(list.length > 0)));
        list.push(now + +(list.at(-1) <= now)); // 현재 뜬 헤어의 인덱스 저장, now 뒤에 더하는 이유는 최근 헤어 제외 목적
    }

    const rslt = `로얄 헤어 (목표: ${MapleProb.ROYALHAIR_PROBTABLE[gender][goalhair]}) 결과\n\n수행 횟수: ${
        list.length
    }회\n\n진행 과정\n${list.map((v, i) => `${i + 1}번째: ${MapleProb.ROYALHAIR_PROBTABLE[gender][v]}`).join('\n')}`;
    return message.channel.send(rslt);
}
export const commandData = {
    name: '헤어',
    description: '로얄 헤어 관련 기능을 수행합니다.',
    options: [
        {
            name: '확률',
            type: 'SUB_COMMAND',
            description: '현재 로얄 헤어의 확률을 보여줍니다.'
        },
        {
            name: '남',
            type: 'SUB_COMMAND',
            description: '남자 캐릭터의 헤어 시뮬레이션을 수행합니다.',
            options: [
                {
                    name: '목표_헤어_이름',
                    type: 'STRING',
                    description: '시뮬레이션의 목표 헤어',
                    required: true
                }
            ]
        },
        {
            name: '여',
            type: 'SUB_COMMAND',
            description: '여자 캐릭터의 헤어 시뮬레이션을 수행합니다.',
            options: [
                {
                    name: '목표_헤어_이름',
                    type: 'STRING',
                    description: '시뮬레이션의 목표 헤어',
                    required: true
                }
            ]
        }
    ]
};
export async function commandExecute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === '확률') {
        const rslt = `<로얄 헤어 확률>\n\n- 남자 헤어\n${MapleProb.ROYALHAIR_PROBTABLE['남']
            .map((v) => `${v}: 16.67%`)
            .join('\n')}\n\n- 여자 헤어\n${MapleProb.ROYALHAIR_PROBTABLE['여'].map((v) => `${v}: 16.67%`).join('\n')}`;
        return interaction.followUp(rslt);
    } else {
        const goalhair = MapleProb.ROYALHAIR_PROBTABLE[subcommand].findIndex((v) =>
            v.replace(/\s+/, '').includes(interaction.options.getString('목표_헤어_이름'))
        );
        if (goalhair === -1) {
            return interaction.followUp(
                `**${usage}**\n현재 로얄 헤어의 시뮬레이션만 수행할 수 있습니다.\n남: ${MapleProb.ROYALHAIR_PROBTABLE[
                    '남'
                ].join(', ')}\n여: ${MapleProb.ROYALHAIR_PROBTABLE['여'].join(', ')}`
            );
        }
        // subcommand은 성별, goalhair는 목표 헤어의 인덱스
        // random은 0이상 1미만
        const list = []; // 진행 과정 담을 배열 (인덱스 저장)

        while (list.at(-1) !== goalhair) {
            // 목표 헤어를 띄웠으면 종료
            const now = Math.floor(
                Math.random() * (MapleProb.ROYALHAIR_PROBTABLE[subcommand].length - +(list.length > 0))
            );
            list.push(now + +(list.at(-1) <= now)); // 현재 뜬 헤어의 인덱스 저장, now 뒤에 더하는 이유는 최근 헤어 제외 목적
        }

        const rslt = `로얄 헤어 (목표: ${MapleProb.ROYALHAIR_PROBTABLE[subcommand][goalhair]}) 결과\n\n수행 횟수: ${
            list.length
        }회\n\n진행 과정\n${list
            .map((v, i) => `${i + 1}번째: ${MapleProb.ROYALHAIR_PROBTABLE[subcommand][v]}`)
            .join('\n')}`;
        return interaction.followUp(rslt);
    }
}
