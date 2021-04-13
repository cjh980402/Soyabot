const { MessageEmbed, Collection } = require('../util/discord.js-extend');
const { replyAdmin } = require('../admin/bot_control');
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
            return message.reply('사용이 불가능한 채널입니다.'); // 그룹톡 여부 체크
        }
        if (args.length < 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        if (message.channel.activeCollector) {
            return message.reply('메시지 수집기가 이 채널에서 이미 활성화됐습니다.');
        }
        if (!message.member.voice.channel) {
            return message.reply('음성 채널에 먼저 참가해주세요!');
        }

        const search = args.join(' ');
        const resultsEmbed = new MessageEmbed().setTitle('**재생할 노래의 번호를 알려주세요.**').setDescription(`${search}의 검색 결과`).setColor('#FF9899');

        const filter = (await ytsr.getFilters(search)).get('Type').get('Video').url;
        const results = filter && (await ytsr(filter, { limit: 10 })).items.filter((v) => v.type == 'video'); // 영상만 가져오기
        // const results = await youtube.searchVideos(search, 10);
        if (!results?.length) {
            return message.reply('검색 내용에 해당하는 영상을 찾지 못했습니다.');
        }

        // results.forEach((video, index) => resultsEmbed.addField(video.shortURL, `${index + 1}. ${video.title.decodeHTML().decodeHTML()}`));
        results.forEach((video, index) => resultsEmbed.addField(`https://youtu.be/${video.id}`, `${index + 1}. ${video.title}`));

        const resultsMessage = await message.channel.send(resultsEmbed);

        message.channel.activeCollector = true;
        try {
            let songChoice;
            const response = await message.channel.awaitMessages((msg) => msg.author.id == message.author.id && (songChoice = msg.content.split(',')).every((v) => !isNaN(v) && 1 <= +v && +v <= results.length), { max: 1, time: 20000, errors: ['time'] });

            for (let song of songChoice) {
                await client.commands.find((cmd) => cmd.command.includes('play')).execute(message, [resultsEmbed.fields[+song - 1].name]);
            }

            delete message.channel.activeCollector;
            resultsMessage.delete();
            response.first().delete();
        } catch (e) {
            if (!(e instanceof Collection)) {
                // awaitMessages에서 발생한 시간초과 에러는 Collection<Snowflake, Message>
                replyAdmin(`작성자: ${message.author.username}\n방 ID: ${message.channel.id}\n채팅 내용: ${message.content}\n에러 내용: ${e}\n${e.stack ?? e._p}`);
            } else if (e.message == 'Missing Permissions') {
                message.channel.send('**권한이 없습니다 - [MANAGE_MESSAGES]**');
            }
            delete message.channel.activeCollector;
            resultsMessage.delete();
        }
    }
};
