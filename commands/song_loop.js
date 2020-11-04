const { canModifyQueue } = require("../util/SoyabotUtil");

module.exports = {
    usage: `${client.prefix}loop`,
    command: ["loop", 'l'],
    description: "- 반복 재생 상태를 전환합니다.",
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

        // toggle from false to true and reverse
        queue.loop = !queue.loop;
        return queue.textChannel.send(`현재 반복 재생 상태 : ${queue.loop ? "**켜짐**" : "**꺼짐**"}`);
    }
};
