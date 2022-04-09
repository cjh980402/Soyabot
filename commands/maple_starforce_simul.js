import { PREFIX } from '../soyabot_config.js';
import { NormalItem } from '../classes/NormalItem.js';

export const usage = `${PREFIX}스타포스시뮬 A B C D E F`;
export const command = ['스타포스시뮬', 'ㅅㅌㅍㅅㅅㅁ'];
export const description = `- A: 아이템 레벨 제한 (98 ~ 250)
- B: 시작 스타포스 개수
- C: 목표 스타포스 개수
- D: 스타캐치 미적용 = 0 / 스타캐치 적용 = 1
- E: 이벤트 미적용 = 0
     30퍼 할인 이벤트 = 1
     5, 10, 15성 100% 성공 이벤트 = 2
     10성 이하 1 + 1 이벤트 = 3
- F: 파괴 방지 미적용 = 0
     파괴 방지 (12 ~ 17성 적용) = 1
     파괴 방지 (15 ~ 17성 적용) = 2`;
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (!args[0]) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }
    const result = new NormalItem();
    return message.channel.send(result.doingStarforce(args.map(Number)));
}
export const commandData = {
    name: '스타포스시뮬',
    description: '일반 장비템의 스타포스 시뮬레이션을 수행합니다.',
    options: [
        {
            name: '아이템_레벨_제한',
            type: 'INTEGER',
            description: '시뮬레이션 대상 아이템의 레벨 제한',
            required: true
        },
        {
            name: '시작_스타포스_개수',
            type: 'INTEGER',
            description: '시뮬레이션 시작 스타포스 개수',
            required: true
        },
        {
            name: '목표_스타포스_개수',
            type: 'INTEGER',
            description: '시뮬레이션 목표 스타포스 개수',
            required: true
        },
        {
            name: '스타캐치',
            type: 'INTEGER',
            description: '스타캐치 적용 유무',
            choices: [
                { name: '스타캐치 미적용', value: 0 },
                { name: '스타캐치 적용', value: 1 }
            ]
        },
        {
            name: '할인_이벤트',
            type: 'INTEGER',
            description: '적용할 스타포스 할인 이벤트',
            choices: [
                { name: '이벤트 미적용', value: 0 },
                { name: '30퍼 할인 이벤트', value: 1 },
                { name: '5, 10, 15성 100% 성공 이벤트', value: 2 },
                { name: '10성 이하 1 + 1 이벤트', value: 3 }
            ]
        },
        {
            name: '파괴_방지',
            type: 'INTEGER',
            description: '적용할 파괴 방지의 종류',
            choices: [
                { name: '파괴 방지 미적용', value: 0 },
                { name: '파괴 방지 (12 ~ 17성 적용)', value: 1 },
                { name: '파괴 방지 (15 ~ 17성 적용)', value: 2 }
            ]
        }
    ]
};
export async function commandExecute(interaction) {
    const result = new NormalItem();
    return interaction.followUp(
        result.doingStarforce([
            interaction.options.getInteger('아이템_레벨_제한'),
            interaction.options.getInteger('시작_스타포스_개수'),
            interaction.options.getInteger('목표_스타포스_개수'),
            interaction.options.getInteger('스타캐치') ?? 1,
            interaction.options.getInteger('할인_이벤트') ?? 0,
            interaction.options.getInteger('파괴_방지') ?? 0
        ])
    );
}
