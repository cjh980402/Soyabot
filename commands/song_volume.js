const { canModifyQueue } = require('../util/soyabot_util');

module.exports = {
    usage: `${client.prefix}volume (변경할 음량)`,
    command: ['volume', 'v'],
    description: '- 지금 재생 중인 노래의 음량을 변경합니다. (0 ~ 100 범위)',
    type: ['음악'],
    async execute(message, args) {
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

        if (!args[0]) {
            return message.reply(`🔊 현재 음량: **${queue.volume}%**`);
        }
        if (isNaN(args[0])) {
            return message.reply('음량 변경을 위해 숫자를 사용해주세요.');
        }

        const volume = Math.trunc(args[0]);
        if (volume > 100 || volume < 0) {
            return message.reply('0 ~ 100 범위의 음량만 가능합니다.');
        }

        queue.volume = volume;
        queue.audioPlayer.state.resource.volume.setVolume(queue.volume / 100);
        return message.channel.send(`변경된 음량: **${queue.volume}%**`);
    }
};
