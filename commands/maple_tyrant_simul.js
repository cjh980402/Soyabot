import SuperialItem from '../util/superial_starforce.js';

export const usage = `${client.prefix}타일런트시뮬 A B C`;
export const command = ['타일런트시뮬', 'ㅌㅇㄹㅌㅅㅁ', 'ㅌㅇㄾㅅㅁ'];
export const description = `- A: 시작 스타포스 개수
- B: 목표 스타포스 개수
- C: 스타캐치 미적용 = 0 / 스타캐치 적용 = 1`;
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (!args[0]) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }
    const result = new SuperialItem();
    return message.channel.send(result.doingStarforce(args.map((v) => +v)));
}
export const commandData = {
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
};
export async function commandExecute(interaction) {
    const result = new SuperialItem();
    return interaction.followUp(
        result.doingStarforce([
            interaction.options.getInteger('시작_스타포스_개수'),
            interaction.options.getInteger('목표_스타포스_개수'),
            interaction.options.getInteger('스타캐치') ?? 1
        ])
    );
}
