const { MessageEmbed, MessageAttachment } = require("discord.js");
const mapleModule = require("../util/maple_parsing");

module.exports = {
    name: "코디",
    aliases: ["ㅋㄷ"],
    type: ["메이플"],
    description: "해당 캐릭터가 착용한 코디템과 헤어, 성형 출력",
    async execute(message, args) {
        if (!args[0])
            return;
        const Maple = new mapleModule(args[0]);
        if ((await Maple.isExist()) == null || Maple.homeLevel() == null) {
            return message.channel.send(`[${args[0]}]\n존재하지 않는 캐릭터입니다.`);
        }
        if (!(await Maple.isLatest())) {
            message.channel.send('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await Maple.updateGG())) {
                message.channel.send('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }

        const coordi = Maple.Coordi();
        if (coordi == null)
            message.channel.send(`[${args[0]}]\n코디 정보가 없습니다.`);
        else {
            const attachment = new MessageAttachment(Maple.userImg(), 'coordi.png');
            const coordiEmbed = new MessageEmbed()
                .setTitle(`${args[0]}님의 코디`)
                .setColor("#F8AA2A")
                .attachFiles(attachment)
                .setURL(`https://maple.gg/u/${args[0]}`)
                .setImage('attachment://coordi.png');

            coordiEmbed.addField('**헤어**', coordi[1], true);
            coordiEmbed.addField('**성형**', coordi[2], true);
            coordiEmbed.addField('**모자**', coordi[0], true);
            coordiEmbed.addField('**상의**', coordi[3], true);
            coordiEmbed.addField('**하의**', coordi[4], true);
            coordiEmbed.addField('**신발**', coordi[5], true);
            coordiEmbed.addField('**무기**', coordi[6], true);

            coordiEmbed.setTimestamp();
            return message.channel.send(coordiEmbed).catch(console.error);
        }
    }
};
