const { MessageEmbed } = require('../util/discord.js-extend');
const { MapleUser } = require('../util/maple_parsing');
const { levelTable } = require('../util/soyabot_const.json');

module.exports = {
    usage: `${client.prefix}정보 (닉네임)`,
    command: ['정보', 'ㅈㅂ'],
    description: '- 해당 캐릭터의 전체적인 정보를 출력합니다.',
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

        const char_union = await mapleUserInfo.homeUnion(); // 유니온 레벨, 전투력, 수급량
        const char_lv = level[0]; // 레벨
        const char_ex = level[1];
        const char_percent = ((char_ex / (levelTable[char_lv] - levelTable[char_lv - 1])) * 100).toFixed(3); // 경험치 퍼센트
        const char_job = level[4]; // 직업
        const char_guild = level[3]; // 길드
        const char_popul = level[2]; // 인기도
        const char_murung = mapleUserInfo.Murung(); // 1: 층수, 2: 클리어 시간
        const char_seed = mapleUserInfo.Seed(); // 1: 층수, 2: 클리어 시간
        const char_rank = mapleUserInfo.Rank(); // 종합, 월드, 직업(월드), 직업(전체)

        const infoEmbed = new MessageEmbed()
            .setTitle(`**${mapleUserInfo.Name}님의 정보**`)
            .setColor('#FF9999')
            .setURL(mapleUserInfo.GGURL)
            .setImage(mapleUserInfo.userImg())
            .addField('**레벨**', char_lv < 300 ? `${char_lv} (${char_percent}%)` : char_lv, true)
            .addField('**직업**', char_job, true)
            .addField('**길드**', char_guild || '-', true)
            .addField('**인기도**', char_popul.toLocaleString(), true)
            .addField('**유니온 정보**', char_union ? `레벨: ${char_union[0].toLocaleString()} (코인 1일 ${char_union[2]}개)\n전투력: ${char_union[1].toLocaleString()}` : '-', true)
            .addField('**무릉 기록**', char_murung ? `${char_murung[1]} (${char_murung[2]})` : '-', true)
            .addField('**시드 기록**', char_seed ? `${char_seed[1]} (${char_seed[2]})` : '-', true)
            .addField('**종합 랭킹**', char_rank ? `전체: ${char_rank[0]}\n월드: ${char_rank[1]}` : '-', true)
            .addField('**직업 랭킹**', char_rank ? `전체: ${char_rank[3]}\n월드: ${char_rank[2]}` : '-', true);

        return message.channel.send({ embeds: [infoEmbed] });
    },
    interaction: {
        name: '정보',
        description: '해당 캐릭터의 전체적인 정보를 출력합니다.',
        options: [
            {
                name: '닉네임',
                type: 'STRING',
                description: '전체적인 정보를 검색할 캐릭터의 닉네임',
                required: true
            }
        ]
    },
    async interactionExecute(interaction) {
        const mapleUserInfo = new MapleUser(interaction.options.get('닉네임').value);

        const level = await mapleUserInfo.homeLevel();
        if (!level) {
            return message.channel.send(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
        }
        if (!(await mapleUserInfo.isLatest())) {
            interaction.editReply('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await mapleUserInfo.updateGG())) {
                interaction.editReply('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }

        const char_union = await mapleUserInfo.homeUnion(); // 유니온 레벨, 전투력, 수급량
        const char_lv = level[0]; // 레벨
        const char_ex = level[1];
        const char_percent = ((char_ex / (levelTable[char_lv] - levelTable[char_lv - 1])) * 100).toFixed(3); // 경험치 퍼센트
        const char_job = level[4]; // 직업
        const char_guild = level[3]; // 길드
        const char_popul = level[2]; // 인기도
        const char_murung = mapleUserInfo.Murung(); // 1: 층수, 2: 클리어 시간
        const char_seed = mapleUserInfo.Seed(); // 1: 층수, 2: 클리어 시간
        const char_rank = mapleUserInfo.Rank(); // 종합, 월드, 직업(월드), 직업(전체)

        const infoEmbed = new MessageEmbed()
            .setTitle(`**${mapleUserInfo.Name}님의 정보**`)
            .setColor('#FF9999')
            .setURL(mapleUserInfo.GGURL)
            .setImage(mapleUserInfo.userImg())
            .addField('**레벨**', char_lv < 300 ? `${char_lv} (${char_percent}%)` : char_lv, true)
            .addField('**직업**', char_job, true)
            .addField('**길드**', char_guild || '-', true)
            .addField('**인기도**', char_popul.toLocaleString(), true)
            .addField('**유니온 정보**', char_union ? `레벨: ${char_union[0].toLocaleString()} (코인 1일 ${char_union[2]}개)\n전투력: ${char_union[1].toLocaleString()}` : '-', true)
            .addField('**무릉 기록**', char_murung ? `${char_murung[1]} (${char_murung[2]})` : '-', true)
            .addField('**시드 기록**', char_seed ? `${char_seed[1]} (${char_seed[2]})` : '-', true)
            .addField('**종합 랭킹**', char_rank ? `전체: ${char_rank[0]}\n월드: ${char_rank[1]}` : '-', true)
            .addField('**직업 랭킹**', char_rank ? `전체: ${char_rank[3]}\n월드: ${char_rank[2]}` : '-', true);

        return interaction.editReply({ embeds: [infoEmbed] });
    }
};
