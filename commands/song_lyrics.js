const { MessageEmbed } = require("discord.js");
const lyricsFinder = require("lyrics-finder");

module.exports = {
    usage: `${client.prefix}lyrics`,
    command: ["lyrics", "ly"],
    description: "- 현재 재생 중인 노래의 가사를 출력합니다.",
    type: ["음악"],
    async execute(message) {
        if (!message.guild) {
            return message.reply("사용이 불가능한 채널입니다."); // 그룹톡 여부 체크
        }
        const queue = message.client.queue.get(message.guild.id);
        if (!queue) {
            return message.channel.send("재생 중인 노래가 없습니다.");
        }

        let lyrics = null;

        try {
            lyrics = await lyricsFinder(queue.songs[0].title, "");
            if (!lyrics) {
                lyrics = `${queue.songs[0].title}의 가사를 찾지 못했습니다.`;
            }
        }
        catch (error) {
            lyrics = `${queue.songs[0].title}의 가사를 찾지 못했습니다.`;
        }

        const lyricsEmbed = new MessageEmbed()
            .setTitle("가사")
            .setDescription(lyrics)
            .setColor("#F8AA2A")
            .setTimestamp();

        if (lyricsEmbed.description.length >= 2048) {
            lyricsEmbed.description = `${lyricsEmbed.description.substr(0, 2045)}...`;
        }
        return message.channel.send(lyricsEmbed);
    }
};
