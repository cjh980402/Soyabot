const { MessageEmbed } = require('../util/discord.js-extend');

function generateHelpEmbed(help) {
    const embeds = [];
    for (let i = 0; i < help.length; i += 7) {
        const info = help.slice(i, i + 7).join('\n');
        const embed = new MessageEmbed().setTitle(`**${client.user.username} 도움말**`).setColor('#FF9899').setDescription(`모든 명령어 목록\n\n${info}`).setTimestamp();
        embeds.push(embed);
    }
    return embeds;
}

module.exports = {
    usage: `${client.prefix}help (카테고리│명령어 이름)`,
    command: ['help', 'h', '도움말', '명령어', 'ㄷㅇㅁ', 'ㅁㄹㅇ'],
    description: `- 카테고리나 명령어 이름을 입력하면 해당하는 명령어의 도움말을 출력합니다.
카테고리는 메이플, 음악, 기타가 있으며 카테고리나 명령어 이름을 생략시 모든 명령어의 도움말을 출력합니다.`,
    type: ['메이플', '음악', '기타'],
    async execute(message, args) {
        // description이 없는 명령어는 히든 명령어
        if (args[0] && !this.type.includes(args[0])) {
            const target = client.commands.find((cmd) => cmd.command.includes(args[0]));
            if (!target?.description) {
                return message.channel.send('지원하지 않는 도움말입니다.');
            } else {
                return message.channel.send(`**${target.usage}**\n- 대체 명령어: ${target.command.join(', ')}\n${target.description}`);
            }
        }

        const description = client.commands.filter((cmd) => cmd.description && (cmd.type.includes(args[0]) || !args[0])).map((cmd) => `**${cmd.usage}**\n- 대체 명령어: ${cmd.command.join(', ')}\n${cmd.description}`);

        let currentPage = 0;
        const embeds = generateHelpEmbed(description);
        const helpEmbed = await message.channel.send(`**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
        if (embeds.length > 1) {
            try {
                await helpEmbed.react('⬅️');
                await helpEmbed.react('⏹');
                await helpEmbed.react('➡️');
            } catch {
                return message.channel.send('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
            }
            const filter = (_, user) => message.author.id == user.id;
            const collector = helpEmbed.createReactionCollector(filter, { time: 120000 });

            collector.on('collect', async (reaction, user) => {
                try {
                    if (message.guild) {
                        await reaction.users.remove(user);
                    }
                    if (reaction.emoji.name == '➡️') {
                        currentPage = (currentPage + 1) % embeds.length;
                        helpEmbed.edit(`**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                    } else if (reaction.emoji.name == '⬅️') {
                        currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                        helpEmbed.edit(`**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                    } else if (reaction.emoji.name == '⏹') {
                        collector.stop();
                    }
                } catch {
                    return message.channel.send('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
                }
            });
        }
    }
};
