const { MessageEmbed } = require("discord.js");

module.exports = {
    usage: `${client.prefix}help (카테고리)`,
    command: ["help", "h", "도움말", "명령어", "ㄷㅇㅁ", "ㅁㄹㅇ"],
    description: "- 카테고리는 메이플, 음악, 기타가 있으며 생략시 모든 명령어의 도움말을 출력합니다.",
    type: ["음악", "메이플", "기타"],
    async execute(message, args) {
        if (args[0] && !this.type.includes(args[0])) {
            return message.channel.send("지원하지 않는 도움말입니다.");
        }

        const description = client.commands.filter((cmd) => (cmd.description && (cmd.type.includes(args[0]) || !args[0])))
            .map((cmd) => `**${cmd.usage}**\n- 대체 명령어: ${cmd.command.join(', ')}\n${cmd.description}`);
        // description이 없는 명령어는 히든 명령어

        try {
            let currentPage = 0;
            const embeds = generateHelpEmbed(description);
            const helpEmbed = await message.channel.send(
                `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                embeds[currentPage]
            );
            if (embeds.length > 1) {
                await helpEmbed.react("⬅️");
                await helpEmbed.react("⏹");
                await helpEmbed.react("➡️");

                const filter = (reaction, user) =>
                    ["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) && message.author.id === user.id;
                const collector = helpEmbed.createReactionCollector(filter, { time: 60000 });

                collector.on("collect", async (reaction, user) => {
                    try {
                        if (reaction.emoji.name === "➡️") {
                            currentPage = (currentPage + 1) % embeds.length;
                            helpEmbed.edit(`**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                        }
                        else if (reaction.emoji.name === "⬅️") {
                            currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                            helpEmbed.edit(`**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                        }
                        else {
                            collector.stop();
                            if (message.guild) {
                                reaction.message.reactions.removeAll();
                            }
                        }
                        if (message.guild) {
                            await reaction.users.remove(message.author.id);
                        }
                    }
                    catch {
                        return message.channel.send("**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]!**");
                    }
                });
            }
        }
        catch {
            return message.channel.send("**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]!**");
        }
    }
};

function generateHelpEmbed(help) {
    const embeds = [];
    for (let i = 0; i < help.length; i += 7) {
        const info = help.slice(i, i + 7).join("\n");
        const embed = new MessageEmbed()
            .setTitle(`${client.user.username} 도움말`)
            .setColor("#F8AA2A")
            .setDescription(`모든 명령어 목록\n\n${info}`);
        embeds.push(embed);
    }
    return embeds;
}