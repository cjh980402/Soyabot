const { canModifyQueue } = require("../util/SoyabotUtil");


module.exports = {
    usage: `${client.prefix}stop`,
    command: ["stop"],
    description: "- 지금 재생 중인 노래를 정지",
    type: ["음악"],
    async execute(message) {
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

        queue.songs = [];
        queue.connection.dispatcher.end();
        return queue.textChannel.send(`${message.author} ⏹ 노래를 정지했습니다.`);
    }
};
