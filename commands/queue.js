const { MessageEmbed, splitMessage, escapeMarkdown } = require("discord.js");

module.exports = {
    usage: `${client.prefix}queue`,
    command: ["queue", "q"],
    description: "- 대기열과 지금 재생 중인 노래 출력",
    type: ["음악"],
    execute(message) {
        if (!message.guild) return message.reply("사용이 불가능한 채널입니다.").catch(console.error); // 그룹톡 여부 체크
        const queue = message.client.queue.get(message.guild.id);
        if (!queue) return message.reply("재생 중인 노래가 없습니다.").catch(console.error);

        const description = queue.songs.map((song, index) => `${index + 1}. ${escapeMarkdown(song.title)}`);

        let queueEmbed = new MessageEmbed()
            .setTitle("소야봇 음악 대기열")
            .setDescription(description)
            .setColor("#F8AA2A");

        const splitDescription = splitMessage(description, {
            maxLength: 2048,
            char: "\n",
            prepend: "",
            append: ""
        });

        splitDescription.forEach(async (m) => {
            queueEmbed.setDescription(m);
            message.channel.send(queueEmbed);
        });
    }
};
