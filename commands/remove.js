const { canModifyQueue } = require("../util/SoyabotUtil");

module.exports = {
    usage: `${client.prefix}remove <Queue Number>`,
    command: ["remove"],
    description: "- 대기열에서 노래를 삭제",
    type: ["음악"],
    execute(message, args) {
        if (!message.guild) return message.reply("사용이 불가능한 채널입니다.").catch(console.error); // 그룹톡 여부 체크
        const queue = message.client.queue.get(message.guild.id);
        if (!queue) return message.channel.send("현재 대기열이 없습니다.").catch(console.error);
        if (!canModifyQueue(message.member)) return;

        if (!args.length) return message.channel.send(`**${this.usage}**\n- 대체 명령어 : ${this.command}\n${this.description}`);
        if (isNaN(args[0])) return message.channel.send(`**${this.usage}**\n- 대체 명령어 : ${this.command}\n${this.description}`);

        const song = queue.songs.splice(args[0] - 1, 1);
        queue.textChannel.send(`❌ ${message.author}가 대기열에서 **${song[0].title}**을 삭제했습니다.`);
    }
};
