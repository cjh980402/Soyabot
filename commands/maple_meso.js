const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');

module.exports = {
    usage: `${client.prefix}메소 (서버)`,
    command: ["메소", "ㅁㅅ"],
    description: '- 해당 서버의 메소 시세를 알려줍니다. 서버 이름은 정확히 입력해야 합니다.',
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const mesoData = await (await fetch("https://gamemarket.kr/api/price1.php")).json();
        const serverList = ["스카니아", "베라", "루나", "제니스", "크로아", "유니온", "엘리시움", "이노시스", "레드", "오로라", "아케인", "노바"];
        const serverIndex = serverList.indexOf(args[0]);

        if (serverIndex == -1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        else {
            const mesoEmbed = new MessageEmbed()
                .setTitle(`**${args[0]} 서버 메소 시세**`)
                .setURL("https://talk.gamemarket.kr/maple/graph")
                .setColor("#F8AA2A")
                .addField("**메소마켓**", `${mesoData.mepo[serverIndex]}메포`)
                .addField("**무통거래**", `${mesoData.direct[serverIndex]}원`);

            return message.channel.send(mesoEmbed);
        }
    }
};