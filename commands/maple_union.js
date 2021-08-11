const { MapleUser } = require('../util/maple_parsing');

module.exports = {
    usage: `${client.prefix}유니온 (닉네임)`,
    command: ['유니온', 'ㅇㄴㅇ'],
    description: '- 캐릭터의 유니온 정보와 일일 코인 수급량을 출력합니다.',
    type: ['메이플'],
    async messageExecute(message, args) {
        if (args.length !== 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const mapleUserInfo = new MapleUser(args[0]);
        const union = await mapleUserInfo.homeUnion();
        if (!union) {
            return message.channel.send(`[${mapleUserInfo.Name}]\n존재하지 않거나 월드 내 최고 레벨이 아닌 캐릭터입니다.`);
        } else {
            return message.channel.send(`[${mapleUserInfo.Name}]\n직업: ${union[3]}\n유니온 레벨: ${union[0].toLocaleString()}\n전투력: ${union[1].toLocaleString()}\n일일 코인 수급량: ${union[2]}`);
        }
    },
    interaction: {
        name: '유니온',
        description: '캐릭터의 유니온 정보와 일일 코인 수급량을 출력합니다.',
        options: [
            {
                name: '닉네임',
                type: 'STRING',
                description: '유니온 정보를 검색할 캐릭터의 닉네임',
                required: true
            }
        ]
    },
    async commandExecute(interaction) {
        const mapleUserInfo = new MapleUser(interaction.options.getString('닉네임'));

        const union = await mapleUserInfo.homeUnion();
        if (!union) {
            return interaction.followUp(`[${mapleUserInfo.Name}]\n존재하지 않거나 월드 내 최고 레벨이 아닌 캐릭터입니다.`);
        } else {
            return interaction.followUp(`[${mapleUserInfo.Name}]\n직업: ${union[3]}\n유니온 레벨: ${union[0].toLocaleString()}\n전투력: ${union[1].toLocaleString()}\n일일 코인 수급량: ${union[2]}`);
        }
    }
};
