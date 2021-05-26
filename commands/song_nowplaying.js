const { splitBar } = require('string-progressbar');
const { MessageEmbed } = require('../util/discord.js-extend');

module.exports = {
    usage: `${client.prefix}nowplaying`,
    command: ['nowplaying', 'np'],
    description: '- 지금 재생 중인 노래를 보여줍니다.',
    type: ['음악'],
    async execute(message) {
        if (!message.guild) {
            return message.reply('사용이 불가능한 채널입니다.'); // 그룹톡 여부 체크
        }

        const queue = client.queue.get(message.guild.id);
        if (!queue?.connection.dispatcher) {
            return message.reply('재생 중인 노래가 없습니다.');
        }
        // song.duration: 일반적인 영상 = 노래 길이(초), 생방송 영상 = 0, 재생목록 영상 = -1
        const song = queue.songs[0];
        const seek = (queue.connection.dispatcher.streamTime - queue.connection.dispatcher.pausedTime) / 1000; // 실제로 재생한 시간(초)

        const nowPlaying = new MessageEmbed().setTitle('**현재 재생 중인 노래**').setDescription(`${song.title}\n${song.url}`).setColor('#FF9999').setAuthor(client.user.username);

        if (song.duration >= 0) {
            nowPlaying.addField('\u200b', `${new Date(seek * 1000).toISOString().substr(11, 8)} [${splitBar(song.duration || seek, seek, 20)[0]}] ${song.duration == 0 ? '◉ LIVE' : new Date(song.duration * 1000).toISOString().substr(11, 8)}`);
        }
        if (song.duration > 0) {
            nowPlaying.setFooter(`남은 시간: ${new Date((song.duration - seek) * 1000).toISOString().substr(11, 8)}`);
        }

        return message.channel.send(nowPlaying);
    }
};
