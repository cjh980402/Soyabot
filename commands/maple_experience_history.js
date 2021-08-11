const { MapleUser } = require('../util/maple_parsing');

module.exports = {
    usage: `${client.prefix}경험치히스토리 (닉네임)`,
    command: ['경험치히스토리', 'ㄱㅎㅊㅎㅅㅌㄹ'],
    description: '- 캐릭터의 경험치 내역을 보여줍니다.',
    type: ['메이플'],
    async messageExecute(message, args) {
        if (args.length !== 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const mapleUserInfo = new MapleUser(args[0]);
        if (!(await mapleUserInfo.homeLevel())) {
            return message.channel.send(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
        }
        if (!(await mapleUserInfo.isLatest())) {
            message.channel.send('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await mapleUserInfo.updateGG())) {
                message.channel.send('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }

        const data = mapleUserInfo.ExpHistory();
        if (!data) {
            return message.channel.send(`[${mapleUserInfo.Name}]\n경험치 히스토리를 가져오지 못했습니다.`);
        } else {
            let rslt = `[${mapleUserInfo.Name}]`;
            for (const expData of data) {
                rslt += `\n${expData.date}: Lv.${expData.level} (${expData.exp}%)`;
            }
            return message.channel.send(rslt);
        }
    },
    commandData: {
        name: '경험치히스토리',
        description: '캐릭터의 경험치 내역을 보여줍니다.',
        options: [
            {
                name: '닉네임',
                type: 'STRING',
                description: '경험치히스토리를 검색할 캐릭터의 닉네임',
                required: true
            }
        ]
    },
    async commandExecute(interaction) {
        const mapleUserInfo = new MapleUser(interaction.options.getString('닉네임'));

        if (!(await mapleUserInfo.homeLevel())) {
            return interaction.followUp(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
        }
        if (!(await mapleUserInfo.isLatest())) {
            interaction.editReply('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await mapleUserInfo.updateGG())) {
                interaction.editReply('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }

        const data = mapleUserInfo.ExpHistory();
        if (!data) {
            return interaction.followUp(`[${mapleUserInfo.Name}]\n경험치 히스토리를 가져오지 못했습니다.`);
        } else {
            let rslt = `[${mapleUserInfo.Name}]`;
            for (const expData of data) {
                rslt += `\n${expData.date}: Lv.${expData.level} (${expData.exp}%)`;
            }
            return interaction.followUp(rslt);
        }
    }
};
