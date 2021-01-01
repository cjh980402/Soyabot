const { MessageEmbed, MessageAttachment } = require("discord.js");
const mapleModule = require("../util/maple_parsing");
const { levelTable } = require("../util/soyabot_const.json");

module.exports = {
    usage: `${client.prefix}정보 (닉네임)`,
    command: ["정보", "ㅈㅂ"],
    description: "- 해당 캐릭터의 전체적인 정보를 출력합니다.",
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const Maple = new mapleModule(args[0]);
        const level = (await Maple.isExist()) ? Maple.homeLevel() : null;
        if (level == null) {
            return message.channel.send(`[${Maple.Name}]\n존재하지 않는 캐릭터입니다.`);
        }
        if (!(await Maple.isLatest())) {
            message.channel.send('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await Maple.updateGG())) {
                message.channel.send('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }

        const char_union = (await Maple.isMain()) ? Maple.homeUnion() : null; // 유니온 레벨, 전투력, 수급량
        const char_lv = level[0]; // 레벨
        const char_ex = level[1];
        const char_percent = (char_ex / (levelTable[char_lv] - levelTable[char_lv - 1]) * 100).toFixed(3); // 경험치 퍼센트
        const char_job = level[4]; // 직업
        const char_guild = level[3]; // 길드
        const char_popul = level[2]; // 인기도
        const char_murung = Maple.Murung(); // 1 : 층수, 2 : 클리어 시간
        const char_seed = Maple.Seed(); // 1 : 층수, 2 : 클리어 시간
        const char_rank = Maple.Rank(); // 종합, 월드, 직업(월드), 직업(전체)

        const attachment = new MessageAttachment(Maple.userImg(), 'info.png');
        const infoEmbed = new MessageEmbed()
            .setTitle(`${Maple.Name}님의 정보`)
            .setColor("#F8AA2A")
            .attachFiles(attachment)
            .setURL(Maple.GGURL)
            .setImage('attachment://info.png')
            .addField('**레벨**', char_lv < 300 ? `${char_lv} (${char_percent}%)` : char_lv, true)
            .addField('**직업**', char_job, true)
            .addField('**길드**', char_guild || '-', true)
            .addField('**인기도**', char_popul.toLocaleString(), true)
            .addField('**유니온 정보**', char_union ? `레벨: ${char_union[0].toLocaleString()}\n전투력: ${char_union[1].toLocaleString()}` : '-', true);
        if (char_union) {
            infoEmbed.addField('유니온 코인', `1일 ${char_union[2]}개 획득`, true);
        }
        infoEmbed.addField('**무릉 기록**', char_murung ? `${char_murung[1]} (${char_murung[2]})` : '-', true)
            .addField('**시드 기록**', char_seed ? `${char_seed[1]} (${char_seed[2]})` : '-', true)
            .addField('**종합 랭킹**', char_rank ? `전체: ${char_rank[0]}\n월드: ${char_rank[1]}` : '-', true)
            .addField('**직업 랭킹**', char_rank ? `전체: ${char_rank[3]}\n월드: ${char_rank[2]}` : '-', true);

        return message.channel.send(infoEmbed);
    }
};
