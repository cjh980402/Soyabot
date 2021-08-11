const SuperialItem = require('../util/superial_starforce');

module.exports = {
    usage: `${client.prefix}타일런트시뮬 A B C`,
    command: ['타일런트시뮬', 'ㅌㅇㄹㅌㅅㅁ', 'ㅌㅇㄾㅅㅁ'],
    description: `- A: 시작 스타포스 개수
- B: 목표 스타포스 개수
- C: 스타캐치 미적용 = 0 / 스타캐치 적용 = 1`,
    type: ['메이플'],
    async messageExecute(message, args) {
        if (!args[0]) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const result = new SuperialItem();
        return message.channel.send(result.doingStarforce(args.map((v) => +v)));
    },
    commandData: {
        name: '타일런트시뮬',
        description: '타일런트 장비템의 스타포스 시뮬레이션을 수행합니다.',
        options: [
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
            }
        ]
    },
    async commandExecute(interaction) {
        const args = interaction.options.data.map((v) => v.value);

        const result = new SuperialItem();
        return interaction.followUp(result.doingStarforce(args));
    }
};
