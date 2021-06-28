const { MessageEmbed, Collection } = require('../util/discord.js-extend');
// const { GOOGLE_API_KEY } = require("../soyabot_config.json");
// const YouTubeAPI = require("simple-youtube-api");
// const youtube = new YouTubeAPI(GOOGLE_API_KEY);
const ytsr = require('ytsr');

module.exports = {
    usage: `${client.prefix}search (영상 제목)`,
    command: ['search', 's'],
    description: '- 재생할 노래를 검색하고 선택합니다. (,로 구분하여 여러 노래 선택 가능)',
    type: ['음악'],
    async execute(message, args) {
        if (!message.guild) {
            return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
        }
        if (args.length < 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        if (!message.member.voice.channel) {
            return message.reply('음성 채널에 먼저 참가해주세요!');
        }

        const search = args.join(' ');
        const filter = (await ytsr.getFilters(search)).get('Type').get('Video').url;
        const results = filter && (await ytsr(filter, { limit: 10 })).items.filter((v) => v.type === 'video'); // 영상만 가져오기
        // const results = await youtube.searchVideos(search, 10);
        if (!results?.length) {
            return message.reply('검색 내용에 해당하는 영상을 찾지 못했습니다.');
        }

        const resultsEmbed = new MessageEmbed().setTitle('**재생할 노래의 번호를 알려주세요.**').setDescription(`${search}의 검색 결과`).setColor('#FF9999');
        // results.forEach((video, index) => resultsEmbed.addField(`**${index + 1}. ${video.title.decodeHTML().decodeHTML()}**`, video.shortURL));
        results.forEach((video, index) => resultsEmbed.addField(`**${index + 1}. ${video.title}**`, `https://youtu.be/${video.id}`));

        const resultsMessage = await message.channel.send({ embeds: [resultsEmbed] });

        try {
            let songChoice;
            const rslt = await message.channel.awaitMessages({
                filter: (msg) => msg.author.id === message.author.id && (songChoice = msg.content.split(',')).every((v) => !isNaN(v) && 1 <= +v && +v <= results.length),
                max: 1,
                time: 20000,
                errors: ['time']
            });

            const playCommand = client.commands.find((cmd) => cmd.command.includes('play'));
            for (let song of songChoice) {
                await playCommand.execute(message, [resultsEmbed.fields[Math.trunc(song) - 1].value]);
            }

            try {
                await rslt.first().delete();
            } catch {}
        } catch (e) {
            if (!(e instanceof Collection)) {
                throw e; // 시간초과 에러(Collection<Snowflake, Message>)가 아닌 경우 에러를 다시 throw
            }
        } finally {
            try {
                await resultsMessage.delete();
            } catch {}
        }
    }
};
