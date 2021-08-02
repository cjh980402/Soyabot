const { cmd } = require('../admin/admin_function');
const { MapleUser } = require('../util/maple_parsing');

module.exports = {
    usage: `${client.prefix}컬렉션 (닉네임)`,
    command: ['컬렉션', 'ㅋㄹㅅ', 'ㅋㄽ'],
    description: '- 캐릭터의 메이플 gg 코디 컬렉션을 출력합니다.',
    type: ['메이플'],
    async messageExecute(message, args) {
        if (args.length !== 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const mapleUserInfo = new MapleUser(args[0]);
        if (!(await mapleUserInfo.homeLevel())) {
            return message.channel.send(`[${args[0]}]\n존재하지 않는 캐릭터입니다.`);
        }
        if (!(await mapleUserInfo.isLatest())) {
            message.channel.send('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await mapleUserInfo.updateGG())) {
                message.channel.send('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }

        const collection = mapleUserInfo.Collection();
        if (!collection) {
            return message.channel.send(`${mapleUserInfo.Name}님의 코디 컬렉션을 가져오지 못하였습니다.`);
        } else {
            await cmd(`python3 ./util/maple_coordi_collection.py ${collection[0].length} ${collection[0].join(' ')} ${collection[1].join(' ')}`);
            return message.channel.send({ content: `${mapleUserInfo.Name}님의 코디 컬렉션`, files: ['./pictures/collection.png'] });
        }
    },
    interaction: {
        name: '컬렉션',
        description: '캐릭터의 메이플 gg 코디 컬렉션을 출력합니다.',
        options: [
            {
                name: '닉네임',
                type: 'STRING',
                description: '컬렉션을 출력할 캐릭터의 닉네임',
                required: true
            }
        ]
    },
    async interactionExecute(interaction) {
        const mapleUserInfo = new MapleUser(interaction.options.get('닉네임').value);

        if (!(await mapleUserInfo.homeLevel())) {
            return interaction.editReply(`[${args[0]}]\n존재하지 않는 캐릭터입니다.`);
        }
        if (!(await mapleUserInfo.isLatest())) {
            interaction.editReply('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await mapleUserInfo.updateGG())) {
                interaction.editReply('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }

        const collection = mapleUserInfo.Collection();
        if (!collection) {
            return interaction.editReply(`${mapleUserInfo.Name}님의 코디 컬렉션을 가져오지 못하였습니다.`);
        } else {
            await cmd(`python3 ./util/maple_coordi_collection.py ${collection[0].length} ${collection[0].join(' ')} ${collection[1].join(' ')}`);
            return interaction.editReply({ content: `${mapleUserInfo.Name}님의 코디 컬렉션`, files: ['./pictures/collection.png'] });
        }
    }
};
