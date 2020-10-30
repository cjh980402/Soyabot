const { MessageEmbed, Collection } = require("discord.js");
const { YOUTUBE_API_KEY } = require("../config.json");
const YouTubeAPI = require("simple-youtube-api");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);

module.exports = {
    usage: `${client.prefix}search <Video Name>`,
    command: ["search"],
    description: "- 재생할 노래를 검색하고 선택",
    type: ["음악"],
    async execute(message, args) {
        if (!message.guild) {
            return message.reply("사용이 불가능한 채널입니다."); // 그룹톡 여부 체크
        }
        if (!args.length) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어 : ${this.command.join(', ')}\n${this.description}`);
        }
        if (message.channel.activeCollector) {
            return message.reply("메시지 수집기가 이 채널에서 이미 활성화됐습니다.");
        }
        if (!message.member.voice.channel) {
            return message.reply("음성 채널에 먼저 참가해주세요!");
        }

        const search = args.join(" ");

        let resultsEmbed = new MessageEmbed()
            .setTitle(`**재생할 노래의 번호를 알려주세요.**`)
            .setDescription(`${search}의 검색 결과`)
            .setColor("#F8AA2A");

        try {
            const results = await youtube.searchVideos(search, 10);
            if (results.length == 0) {
                return message.reply("해당 제목에 맞는 비디오를 찾지 못했습니다.");
            }

            results.map((video, index) => resultsEmbed.addField(video.shortURL, `${index + 1}. ${video.title.htmlDecode()}`));

            var resultsMessage = await message.channel.send(resultsEmbed);

            function filter(msg) {
                const pattern = /(^[1-9][0-9]{0,1}$)/g;
                return pattern.test(msg.content) && parseInt(msg.content.match(pattern)[0]) <= 10;
            }

            message.channel.activeCollector = true;
            const response = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] });
            const choice = resultsEmbed.fields[parseInt(response.first()) - 1].name;

            message.channel.activeCollector = false;
            message.client.commands.find((cmd) => cmd.command.includes("play")).execute(message, [choice]);
            resultsMessage.delete();
        }
        catch (error) {
            if (!(error instanceof Collection)) {
                console.error(error); // 에러가 awaitMessages의 시간초과 때문이라면, 에러는 Collection<Snowflake, Message>
            }
            message.channel.activeCollector = false;
            resultsMessage.delete();
        }
    }
};
