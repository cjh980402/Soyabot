const { replyAdmin } = require("../admin/bot_control");

module.exports = {
    usage: `${client.prefix}건의 (건의 사항)`,
    command: ["건의", "ㄱㅇ"],
    description: "- 개발자에게 건의 사항을 전송합니다.",
    type: ["기타"],
    execute(message, args) {
        if (args.length < 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        client.suggestionChat[message.id] = message;
        const rslt = replyAdmin(`${message.id}\n작성자: ${message.author.username}\n건의 내용: ${args.join(' ')}`);
        return message.replyTo(rslt ? "건의사항이 전송되었습니다." : "건의사항 전송을 실패했습니다.");
    }
};