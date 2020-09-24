const { canModifyQueue } = require("../util/SoyabotUtil");

module.exports = {
    usage: `${client.prefix}shuffle`,
    command: ["shuffle"],
    description: "- 대기열 순서를 랜덤하게 섞음",
    type: ["음악"],
    execute(message) {
        if (!message.guild) return message.reply("사용이 불가능한 채널입니다.").catch(console.error); // 그룹톡 여부 체크
        const queue = message.client.queue.get(message.guild.id);
        if (!queue) return message.channel.send("현재 대기열이 없습니다.").catch(console.error);
        if (!canModifyQueue(message.member)) return;

        let songs = queue.songs;
        for (let i = songs.length - 1; i > 1; i--) {
            let j = 1 + Math.floor(Math.random() * i);
            [songs[i], songs[j]] = [songs[j], songs[i]];
        }
        queue.songs = songs;
        message.client.queue.set(message.guild.id, queue);
        queue.textChannel.send(`${message.author} 🔀 대기열을 섞었습니다.`).catch(console.error);
    }
};
