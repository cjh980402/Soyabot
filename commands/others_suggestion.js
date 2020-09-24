const { ADMIN_ID } = require("../config.json");

module.exports = {
    usage: `${client.prefix}건의 (건의 사항)`,
    command: ["건의", "ㄱㅇ"],
    description: "- 개발자에게 건의 사항을 전송합니다.",
    type: ["기타"],
    execute(message, args) {
        if (args.length < 1)
            return message.channel.send(`**${this.usage}**\n- 대체 명령어 : ${this.command}\n${this.description}`);
        const msg = `작성자 : ${message.author.username}\n방 ID : ${message.channel.id}\n건의 내용 : ${args.join(' ')}`;
        message.client.channels.cache.array().find(v=>v.recipient == ADMIN_ID).send(msg);
        // 개발자의 개인 메시지 채널 추출 후 전송
        message.reply("건의사항이 전송되었습니다.");
    }
};
