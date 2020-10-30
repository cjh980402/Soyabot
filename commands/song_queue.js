const { MessageEmbed } = require("discord.js");

module.exports = {
    usage: `${client.prefix}queue`,
    command: ["queue", "q"],
    description: "- 대기열과 지금 재생 중인 노래 출력",
    type: ["음악"],
    async execute(message) {
        if (!message.guild) {
            return message.reply("사용이 불가능한 채널입니다."); // 그룹톡 여부 체크
        }
        const serverQueue = message.client.queue.get(message.guild.id);
        if (!serverQueue) {
            return message.channel.send("❌ **재생 중인 노래가 없습니다.**");
        }
        try {
            let currentPage = 0;
            const embeds = generateQueueEmbed(message, serverQueue.songs);
            const queueEmbed = await message.channel.send(
                `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                embeds[currentPage]
            );
            await queueEmbed.react("⬅️");
            await queueEmbed.react("⏹");
            await queueEmbed.react("➡️");

            const filter = (reaction, user) =>
                ["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) && message.author.id === user.id;
            const collector = queueEmbed.createReactionCollector(filter, { time: 60000 });

            collector.on("collect", async (reaction, user) => {
                try {
                    if (reaction.emoji.name === "➡️") {
                        currentPage = (currentPage + 1) % embeds.length;
                        queueEmbed.edit(`**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                    }
                    else if (reaction.emoji.name === "⬅️") {
                        currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                        queueEmbed.edit(`**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                    }
                    else {
                        collector.stop();
                        reaction.message.reactions.removeAll();
                    }
                    await reaction.users.remove(message.author.id);
                }
                catch {
                    return message.channel.send("**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]!**");
                }
            });
        }
        catch {
            return message.channel.send("**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]!**");
        }
    }
};

function generateQueueEmbed(message, queue) {
    const embeds = [];
    for (let i = 0; i < queue.length; i += 10) {
        const current = queue.slice(i, i + 10);
        const info = current.map((track, j) => `${i + j + 1} - [${track.title}](${track.url})`).join("\n");
        const embed = new MessageEmbed()
            .setTitle("소야봇 음악 대기열")
            .setThumbnail(message.guild.iconURL())
            .setColor("#F8AA2A")
            .setDescription(`**현재 재생 중인 노래 - [${queue[0].title}](${queue[0].url})**\n\n${info}`)
            .setTimestamp();
        embeds.push(embed);
    }
    return embeds;
}