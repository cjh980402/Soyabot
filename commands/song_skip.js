const { canModifyQueue } = require("../util/SoyabotUtil");

module.exports = {
    usage: `${client.prefix}skip`,
    command: ["skip"],
    description: "- 지금 재생 중인 노래 건너뜁니다.",
    type: ["음악"],
    async execute(message) {
        if (!message.guild) {
            return message.replyTo("사용이 불가능한 채널입니다."); // 그룹톡 여부 체크
        }

        const queue = client.queue.get(message.guild.id);
        if (!queue?.connection.dispatcher) {
            return message.replyTo("재생 중인 노래가 없습니다.");
        }
        if (!canModifyQueue(message.member)) {
            return message.replyTo(`같은 음성 채널에 참가해주세요! (${client.user})`);
        }

        queue.playing = true;
        queue.connection.dispatcher.end();
        return message.channel.send(`${message.author} ⏭ 노래를 건너뛰었습니다.`);
    }
};