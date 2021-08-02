const NormalItem = require('../util/normal_starforce');

module.exports = {
    usage: `${client.prefix}스타포스시뮬 A B C D E F`,
    command: ['스타포스시뮬', 'ㅅㅌㅍㅅㅅㅁ'],
    description: `- A: 아이템 레벨 제한 (98 ~ 200)
- B: 시작 스타포스 개수
- C: 목표 스타포스 개수
- D: 스타캐치 미적용 = 0 / 스타캐치 적용 = 1
- E: 이벤트 미적용 = 0
     30퍼 할인 이벤트 = 1
     5, 10, 15성 100% 성공 이벤트 = 2
     10성 이하 1 + 1 이벤트 = 3
- F: 파괴 방지 미적용 = 0
     파괴 방지 (12 ~ 17성 적용) = 1
     파괴 방지 (15 ~ 17성 적용) = 2`,
    type: ['메이플'],
    async messageExecute(message, args) {
        if (!args[0]) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const result = new NormalItem();
        return message.channel.send(result.doingStarforce(args.map((v) => +v)));
    },
    interaction: {
        name: '스타포스시뮬',
        description: '무기의 작으로 상승한 공격력을 계산합니다.',
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
                description: '스타캐치 미적용 = 0 / 스타캐치 적용 = 1'
            },
            {
                name: '할인_이벤트',
                type: 'INTEGER',
                description: '이벤트 미적용 = 0 / 30퍼 할인 이벤트 = 1 / 5, 10, 15성 100% 성공 이벤트 = 2 / 10성 이하 1 + 1 이벤트 = 3'
            },
            {
                name: '파괴방지',
                type: 'INTEGER',
                description: '파괴 방지 미적용 = 0 / 파괴 방지 (12 ~ 17성 적용) = 1 / 파괴 방지 (15 ~ 17성 적용) = 2'
            }
        ]
    },
    async interactionExecute(interaction) {
        const args = this.interaction.options.map((v) => interaction.options.get(v.name)?.value);

        const result = new NormalItem();
        return interaction.editReply(result.doingStarforce(args));
    }
};
