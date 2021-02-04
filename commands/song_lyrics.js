const { MessageEmbed } = require("discord.js");
const lyricsFinder = require("lyrics-finder");

module.exports = {
    usage: `${client.prefix}lyrics (노래 제목)`,
    command: ["lyrics", "ly"],
    description: "- 입력한 노래의 가사를 출력합니다. 노래 제목을 생략 시에는 현재 재생 중인 노래의 가사를 출력합니다.",
    type: ["음악"],
    async execute(message, args) {
        const queue = client.queue.get(message.guild?.id);
        const title = args.join(" ") || queue?.songs[0].title;
        if (!title) {
            return message.channel.send("검색할 노래가 없습니다.");
        }

        const lyrics = await lyricsFinder(title, "") || "검색된 가사가 없습니다.";

        const lyricsEmbed = new MessageEmbed()
            .setTitle(`**${title} — 가사**`)
            .setDescription(lyrics)
            .setColor("#FF9899")
            .setTimestamp();

        if (lyricsEmbed.description.length >= 2000) {
            lyricsEmbed.description = `${lyricsEmbed.description.substr(0, 1990)}...`;
        }
        return message.channel.send(lyricsEmbed);
    }
};