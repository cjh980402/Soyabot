const { MessageEmbed } = require('../util/discord.js-extend');

function generateQueueEmbed(thumbnail, songs) {
    const embeds = [];
    for (let i = 0; i < songs.length; i += 8) {
        const info = songs
            .slice(i, i + 8)
            .map((track, j) => `${i + j + 1}. [${track.title}](${track.url})`)
            .join('\n\n');
        const embed = new MessageEmbed().setTitle(`**${client.user.username} 음악 대기열**`).setThumbnail(thumbnail).setColor('#FF9999').setDescription(`**현재 재생 중인 노래 - [${songs[0].title}](${songs[0].url})**\n\n${info}`).setTimestamp();
        embeds.push(embed);
    }
    return embeds;
}

module.exports = {
    usage: `${client.prefix}queue`,
    command: ['queue', 'q'],
    description: '- 대기열과 지금 재생 중인 노래 출력합니다.',
    type: ['음악'],
    async execute(message) {
        if (!message.guild) {
            return message.reply('사용이 불가능한 채널입니다.'); // 그룹톡 여부 체크
        }

        const queue = client.queue.get(message.guild.id);
        if (!queue?.connection.dispatcher) {
            return message.channel.send('재생 중인 노래가 없습니다.');
        }
        let currentPage = 0;
        const embeds = generateQueueEmbed(message.guild.iconURL(), queue.songs);
        const queueEmbed = await message.channel.send(`**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
        if (embeds.length > 1) {
            try {
                await queueEmbed.react('⬅️');
                await queueEmbed.react('⏹');
                await queueEmbed.react('➡️');
            } catch {
                return message.channel.send('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
            }
            const filter = (_, user) => message.author.id === user.id;
            const collector = queueEmbed.createReactionCollector(filter, { time: 60000 });

            collector.on('collect', async (reaction, user) => {
                try {
                    await reaction.users.remove(user);
                    switch (reaction.emoji.name) {
                        case '➡️':
                            currentPage = (currentPage + 1) % embeds.length;
                            queueEmbed.edit(`**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                            break;
                        case '⬅️':
                            currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                            queueEmbed.edit(`**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                            break;
                        case '⏹':
                            collector.stop();
                            break;
                    }
                } catch {
                    return message.channel.send('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
                }
            });
        }
    }
};
