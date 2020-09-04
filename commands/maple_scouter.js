const { MessageEmbed, MessageAttachment } = require("discord.js");
const mapleModule = require("../util/maple_parsing");

module.exports = {
    name: "스카우터",
    aliases: ["스카우터", "ㅅㅋㅇㅌ"],
    type: ["메이플"],
    description: "정해진 조건으로 해당 캐릭터의 점수를 평가",
    async execute(message, args) {
        if (!args[0])
            return message.channel.send(`**${message.client.prefix}${this.name} ${this.aliases ? `(${this.aliases})` : ""}**\n${this.description}`);
        const Maple = new mapleModule(args[0]);

        let union = (await Maple.isMain()) ? Maple.homeUnion() : null;
        if (union == null) {
            return message.channel.send(`[${args[0]}]\n존재하지 않거나 월드 내 최고 레벨이 아닌 캐릭터입니다.`);
        }

        if (!(await Maple.isLatest())) {
            message.channel.send('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await Maple.updateGG())) {
                message.channel.send('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }

        let level = (await Maple.isExist()) ? Maple.homeLevel() : null;
        let job = level[4];
        union = union[0];
        level = level[0]

        let murungfl, time, min, sec;

        const data = Maple.Murung();
        if (data == null) {
            murungfl = 0;
            min = 0;
            sec = 0;
            time = 900;
        }
        else {
            murungfl = data[1].replace('층', '') * 1;
            min = data[2].split('분 ')[0] * 1;
            sec = data[2].split('분 ')[1].replace('초', '') * 1;
            time = min * 60 + sec * 1;
        }

        let grade, unitemp = union.replace(',', ''), score = level - 100;
        score += (murungfl >= 45 ? (murungfl * 1 + 1 - time / 900) * 4 : (murungfl * 1 + 1 - time / 900) * 3);
        score += (unitemp >= 8000 ? 250 : unitemp / 40);
        score = Math.floor(score);

        if (score <= 300)
            grade = '메린이';
        else if (score <= 350)
            grade = '무자본 평균';
        else if (score <= 400)
            grade = '메른이';
        else if (score <= 450)
            grade = '메벤 평균';
        else if (score <= 500)
            grade = '경손실 따질 스펙';
        else if (score <= 550)
            grade = '메덕';
        else if (score <= 600)
            grade = '현생보다도 메이플';
        else if (score <= 650)
            grade = '메생살이';
        else
            grade = '초월자';

        const attachment = new MessageAttachment(Maple.userImg(), 'coordi.png');
        const coordiEmbed = new MessageEmbed()
            .setTitle(`${args[0]}님의 측정결과`)
            .setColor("#F8AA2A")
            .attachFiles(attachment)
            .setURL(`https://maple.gg/u/${args[0]}`)
            .setImage('attachment://coordi.png');

        coordiEmbed.addField('**직업**', job, true);
        coordiEmbed.addField('**유니온**', union, true);
        coordiEmbed.addField('**레벨**', level, true);
        coordiEmbed.addField('**무릉 기록**', `${murungfl}층`, true);
        coordiEmbed.addField('**기록 시간**', `${min}분 ${sec}초`, true);
        coordiEmbed.addField('**측정 결과**', `${grade}! (${score}점)`);

        coordiEmbed.setTimestamp();
        return message.channel.send(coordiEmbed);
    }
};
