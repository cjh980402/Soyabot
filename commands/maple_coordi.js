const { MessageEmbed, MessageAttachment } = require("discord.js");
const mapleModule = require("../util/maple_parsing");

module.exports = {
    usage: `${client.prefix}코디 (닉네임)`,
    command: ["코디", "ㅋㄷ"],
    description: "- 해당 캐릭터가 착용한 코디템과 헤어, 성형을 출력합니다.",
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const Maple = new mapleModule(args[0]);
        if (!(await Maple.isExist()) || !Maple.homeLevel()) {
            return message.channel.send(`[${Maple.Name}]\n존재하지 않는 캐릭터입니다.`);
        }
        if (!(await Maple.isLatest())) {
            message.channel.send('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await Maple.updateGG())) {
                message.channel.send('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }

        const coordi = Maple.Coordi();
        if (coordi == null) {
            return message.channel.send(`[${Maple.Name}]\n코디 정보가 없습니다.`);
        }
        else {
            const attachment = new MessageAttachment(Maple.userImg(), 'coordi.png');
            const coordiEmbed = new MessageEmbed()
                .setTitle(`${Maple.Name}님의 코디`)
                .setColor("#F8AA2A")
                .attachFiles(attachment)
                .setURL(Maple.GGURL)
                .setImage('attachment://coordi.png')
                .addField('**헤어**', coordi[1], true)
                .addField('**성형**', coordi[2], true)
                .addField('**모자**', coordi[0], true)
                .addField('**상의**', coordi[3], true)
                .addField('**하의**', coordi[4], true)
                .addField('**신발**', coordi[5], true)
                .addField('**무기**', coordi[6], true);

            return message.channel.send(coordiEmbed);
        }
    }
};