const { canModifyQueue } = require("../util/SoyabotUtil");

module.exports = {
    usage: `${client.prefix}remove (대기열 번호)`,
    command: ["remove", "rm"],
    description: "- 대기열에서 지정한 노래를 삭제합니다.",
    type: ["음악"],
    async execute(message, args) {
        if (!message.guild) {
            return message.reply("사용이 불가능한 채널입니다."); // 그룹톡 여부 체크
        }
        if (!args.length || isNaN(args[0])) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        
        const queue = client.queue.get(message.guild.id);
        if (!queue) {
            return message.channel.send("현재 대기열이 없습니다.");
        }
        if (!canModifyQueue(message.member)) {
            return queue.textChannel.send("음성 채널에 먼저 참가해주세요!");;
        }

        if (+args[0] < 2 || +args[0] > queue.songs.length) {
            return message.reply(`현재 대기열에서 2 ~ ${queue.songs.length}번째 노래를 삭제할 수 있습니다.`);
        }

        const song = queue.songs.splice(args[0] - 1, 1);
        return queue.textChannel.send(`❌ ${message.author}가 대기열에서 **${song[0].title}**을 삭제했습니다.`);
    }
};
