const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = {
    usage: `${client.prefix}lyrics (노래 제목)`,
    command: ["lyrics", "ly", "가사"],
    description: "- 입력한 노래의 가사를 출력합니다. 노래 제목을 생략 시에는 현재 재생 중인 노래의 가사를 출력합니다.",
    type: ["음악"],
    async execute(message, args) {
        const queue = client.queue.get(message.guild?.id);
        const search = args.join(" ") || queue?.songs[0].title;
        if (!search) {
            return message.channel.send("검색할 노래가 없습니다.");
        }

        const lyricsEmbed = new MessageEmbed()
            .setColor("#FF9899")
            .setTimestamp();
        const songData = cheerio.load(await (await fetch(`https://www.melon.com/search/song/index.htm?q=${encodeURI(search)}`)).text())("input[name='input_check']"); // length가 검색 결과 수
        const lyricData = cheerio.load(await (await fetch(`https://www.melon.com/search/lyric/index.htm?q=${encodeURI(search)}`)).text())(".list_lyric .cntt_lyric .btn.btn_icon_detail"); // length가 검색 결과 수
        const songId = songData.eq(0).attr("value") ?? lyricData.eq(0).attr("data-song-no");

        if (songId) {
            const parse = cheerio.load(await (await fetch(`https://www.melon.com/song/detail.htm?songId=${songId}`)).text());
            const title = parse(".song_name").contents().last().text().trim();
            const is19 = parse(".song_name .bullet_icons.age_19.large").length;
            const artist = parse(".artist").eq(0).text().trim();
            const lyrics = parse(".lyric").html()?.replace(/<!--.*-->/g, "").decodeHTML().trim();
            lyricsEmbed.setTitle(`**"${title} - ${artist}"의 가사**`)
                .setDescription(lyrics ?? `${is19 ? "연령 제한이 있는" : "등록된 가사가 없는"} 콘텐츠입니다.`);
        }
        else {
            lyricsEmbed.setTitle(`**"${search}"의 가사**`)
                .setDescription("검색된 노래가 없습니다.");
        }

        if (lyricsEmbed.description.length > 2048) {
            lyricsEmbed.description = `${lyricsEmbed.description.substr(0, 2045)}...`;
        }
        return message.channel.send(lyricsEmbed);
    }
};csEmbed);
    }
};