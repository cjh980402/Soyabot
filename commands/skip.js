const { canModifyQueue } = require("../util/SoyabotUtil");

module.exports = {
    name: "skip",
    aliases: ["s"],
    description: "지금 재생 중인 노래 건너뛰기",
    type: ["음악"],
    execute(message) {
        if (!message.guild) return message.reply("사용이 불가능한 채널입니다.").catch(console.error); // 그룹톡 여부 체크
        const queue = message.client.queue.get(message.guild.id);
        if (!queue)
            return message.reply("재생 중인 노래가 없어서 건너뛸 수 없습니다.").catch(console.error);
        if (!canModifyQueue(message.member)) return;

        queue.playing = true;
        queue.connection.dispatcher.end();
        queue.textChannel.send(`${message.author} ⏭ 노래를 건너뛰었습니다.`).catch(console.error);
    }
};
