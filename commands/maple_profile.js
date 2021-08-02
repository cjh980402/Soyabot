const { cmd } = require('../admin/admin_function');
const { MapleUser } = require('../util/maple_parsing');

module.exports = {
    usage: `${client.prefix}프로필 (닉네임)`,
    command: ['프로필', 'ㅍㄹㅍ', 'ㅍㄿ'],
    description: '- 캐릭터의 메이플 gg 프로필을 출력합니다.',
    type: ['메이플'],
    async messageExecute(message, args) {
        if (args.length !== 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const mapleUserInfo = new MapleUser(args[0]);
        const level = await mapleUserInfo.homeLevel();
        if (!level) {
            return message.channel.send(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
        }
        if (!(await mapleUserInfo.isLatest())) {
            message.channel.send('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await mapleUserInfo.updateGG())) {
                message.channel.send('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }

        const rank = mapleUserInfo.Rank();
        const rankString = rank[2] === '-위' ? ' ' : `월드 ${rank[2]} (전체 ${rank[3]})`;
        const murung = mapleUserInfo.Murung();
        const union = mapleUserInfo.Union();
        const seed = mapleUserInfo.Seed();

        await cmd(
            `python3 ./util/maple_gg_profile.py ${mapleUserInfo.userImg(false)} ${mapleUserInfo.Name} ${mapleUserInfo.serverName()} ${level[0]} '${
                level[4]
            }' ${mapleUserInfo.serverImg()} ${level[2].toLocaleString()} '${level[3] || '(없음)'}' '${rankString}' '${murung ? murung[1] : '기록없음'}' '${murung ? murung[2] : ' '}' '${
                union ? union[3] : '기록없음'
            }' '${union ? `Lv.${union[0].toLocaleString()}` : ' '}' '${seed ? seed[1] : '기록없음'}' '${seed ? seed[2] : ' '}'`
        );
        return message.channel.send({ content: `${mapleUserInfo.Name}님의 프로필`, files: ['./pictures/profile.png'] });
    },
    interaction: {
        name: '프로필',
        description: '캐릭터의 메이플 gg 프로필을 출력합니다.',
        options: [
            {
                name: '닉네임',
                type: 'STRING',
                description: '프로필을 출력할 캐릭터의 닉네임',
                required: true
            }
        ]
    },
    async interactionExecute(interaction) {
        const mapleUserInfo = new MapleUser(interaction.options.get('닉네임').value);

        const level = await mapleUserInfo.homeLevel();
        if (!level) {
            return interaction.editReply(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
        }
        if (!(await mapleUserInfo.isLatest())) {
            interaction.editReply('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await mapleUserInfo.updateGG())) {
                interaction.editReply('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }

        const rank = mapleUserInfo.Rank();
        const rankString = rank[2] === '-위' ? ' ' : `월드 ${rank[2]} (전체 ${rank[3]})`;
        const murung = mapleUserInfo.Murung();
        const union = mapleUserInfo.Union();
        const seed = mapleUserInfo.Seed();

        await cmd(
            `python3 ./util/maple_gg_profile.py ${mapleUserInfo.userImg(false)} ${mapleUserInfo.Name} ${mapleUserInfo.serverName()} ${level[0]} '${
                level[4]
            }' ${mapleUserInfo.serverImg()} ${level[2].toLocaleString()} '${level[3] || '(없음)'}' '${rankString}' '${murung ? murung[1] : '기록없음'}' '${murung ? murung[2] : ' '}' '${
                union ? union[3] : '기록없음'
            }' '${union ? `Lv.${union[0].toLocaleString()}` : ' '}' '${seed ? seed[1] : '기록없음'}' '${seed ? seed[2] : ' '}'`
        );
        return interaction.editReply({ content: `${mapleUserInfo.Name}님의 프로필`, files: ['./pictures/profile.png'] });
    }
};
