const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = {
    usage: `${client.prefix}이벤트`,
    command: ["이벤트", "ㅇㅂㅌ"],
    description: '- 현재 진행 중인 이벤트를 알려줍니다.',
    type: ["메이플"],
    async execute(message) {
        const parse = cheerio.load(await (await fetch("https://maplestory.nexon.com/News/Event")).text());
        const eventdata = parse('.event_all_banner');
        const links = eventdata.find("li dl dt a").map((i, v) => parse(v).attr("href"));
        const names = eventdata.find("li dl dt a").map((i, v) => parse(v).text());
        const dates = eventdata.find("li dl dd a").map((i, v) => parse(v).text());

        if (links.length == 0) {
            return message.channel.send('현재 진행중인 이벤트가 없습니다.')
        }
        else {
            let currentPage = 0;
            const embeds = generateEventEmbed(links, names, dates);
            const eventEmbed = await message.channel.send(
                `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                embeds[currentPage]
            );
            if (embeds.length > 1) {
                try {
                    await eventEmbed.react("⬅️");
                    await eventEmbed.react("⏹");
                    await eventEmbed.react("➡️");
                }
                catch (e) {
                    return message.channel.send("**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**");
                }
                const filter = (reaction, user) => message.author.id == user.id;
                const collector = eventEmbed.createReactionCollector(filter, { time: 60000 });

                collector.on("collect", async (reaction, user) => {
                    try {
                        if (message.guild) {
                            await reaction.users.remove(user);
                        }
                        if (reaction.emoji.name == "➡️") {
                            currentPage = (currentPage + 1) % embeds.length;
                            eventEmbed.edit(`**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                        }
                        else if (reaction.emoji.name == "⬅️") {
                            currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                            eventEmbed.edit(`**현재 페이지 - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                        }
                        else if (reaction.emoji.name == "⏹") {
                            collector.stop();
                        }
                    }
                    catch (e) {
                        return message.channel.send("**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**");
                    }
                });
            }
        }
    }
};

function generateEventEmbed(links, names, dates) {
    const embeds = [];
    for (let i = 0; i < links.length; i += 5) {
        const curLinks = links.slice(i, i + 5);
        const curNames = names.slice(i, i + 5);
        const curDates = dates.slice(i, i + 5);
        const info = Array.from(curLinks.map((j, link) => `${i + j + 1}. [${curNames[j]}](https://maplestory.nexon.com${link})\n기간: ${curDates[j]}`)).join("\n\n");
        const embed = new MessageEmbed()
            .setTitle("진행중인 이벤트")
            .setColor("#F8AA2A")
            .setDescription(info)
            .setTimestamp();
        embeds.push(embed);
    }
    return embeds;
}