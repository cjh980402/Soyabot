const { canModifyQueue } = require("../util/SoyabotUtil");

module.exports = {
    usage: `${client.prefix}volume (변경할 음량)`,
    command: ["volume", "v"],
    description: "- 지금 재생 중인 노래의 음량을 변경합니다. (0 ~ 100 범위)",
    type: ["음악"],
    execute(message, args) {
        if (!message.guild) {
            return message.reply("사용이 불가능한 채널입니다."); // 그룹톡 여부 체크
        }
        const queue = message.client.queue.get(message.guild.id);

        if (!queue) return message.reply("재생 중인 노래가 없습니다.");
        if (!canModifyQueue(message.member)) {
            return queue.textChannel.send("음성 채널에 먼저 참가해주세요!");;
        }

        if (!args[0]) {
            return message.reply(`🔊 현재 음량 : **${queue.volume}%**`);
        }
        if (isNaN(args[0])) {
            return message.reply("음량 변경을 위해 숫자를 사용해주세요.");
        }
        if (parseInt(args[0]) > 100 || parseInt(args[0]) < 0) {
            return message.reply("0 ~ 100 범위의 음량만 가능합니다.");
        }

        queue.volume = args[0];
        queue.connection.dispatcher.setVolumeLogarithmic(args[0] / 100);
        return queue.textChannel.send(`변경된 음량 : **${args[0]}%**`);
    }
};