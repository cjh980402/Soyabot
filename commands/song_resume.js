const { canModifyQueue } = require("../util/SoyabotUtil");

module.exports = {
    usage: `${client.prefix}resume`,
    command: ["resume", "r"],
    description: "- 가장 최근 노래를 다시 재생합니다.",
    type: ["음악"],
    execute(message) {
        if (!message.guild) {
            return message.reply("사용이 불가능한 채널입니다."); // 그룹톡 여부 체크
        }
        const queue = message.client.queue.get(message.guild.id);
        if (!queue) {
            return message.reply("재생 중인 노래가 없습니다.");
        }
        if (!canModifyQueue(message.member)) {
            return queue.textChannel.send("음성 채널에 먼저 참가해주세요!");;
        }

        if (!queue.playing) {
            queue.playing = true;
            queue.connection.dispatcher.resume();
            return queue.textChannel.send(`${message.author} ▶ 노래를 다시 틀었습니다.`);
        }

        return message.reply("대기열이 일시정지 상태가 아닙니다.");
    }
};