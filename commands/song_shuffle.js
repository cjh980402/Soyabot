const { canModifyQueue } = require('../util/soyabot_util');

module.exports = {
    usage: `${client.prefix}shuffle`,
    command: ['shuffle', 'shf'],
    description: '- 대기열 순서를 랜덤하게 섞어줍니다.',
    type: ['음악'],
    async execute(message) {
        if (!message.guild) {
            return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
        }

        const queue = client.queues.get(message.guild.id);
        if (!queue || queue.audioPlayer.state.status === 'idle') {
            return message.reply('재생 중인 노래가 없습니다.');
        }
        if (!canModifyQueue(message.member)) {
            return message.reply(`${client.user}과 같은 음성 채널에 참가해주세요!`);
        }

        const songs = queue.songs; // 배열도 객체의 일종이므로 songs를 변경시 원본이 변경된다.
        for (let i = songs.length - 1; i > 1; i--) {
            let j = 1 + Math.floor(Math.random() * i);
            [songs[i], songs[j]] = [songs[j], songs[i]];
        }
        return message.channel.send(`${message.author} 🔀 대기열을 섞었습니다.`);
    }
};
