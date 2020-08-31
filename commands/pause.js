const { canModifyQueue } = require("../util/SoyabotUtil");

module.exports = {
    name: "pause",
    description: "지금 재생 중인 노래 일시정지",
    type: ["음악"],
    execute(message) {
        if (!message.guild) return message.reply("사용이 불가능한 채널입니다.").catch(console.error); // 그룹톡 여부 체크
        const queue = message.client.queue.get(message.guild.id);
        if (!queue) return message.reply("재생 중인 노래가 없습니다.").catch(console.error);
        if (!canModifyQueue(message.member)) return;

        if (queue.playing) {
            queue.playing = false;
            queue.connection.dispatcher.pause(true);
            return queue.textChannel.send(`${message.author} ⏸ 노래를 일시정지 했습니다.`).catch(console.error);
        }
    }
};
