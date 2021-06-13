const { canModifyQueue } = require('../util/soyabot_util');

module.exports = {
    usage: `${client.prefix}resume`,
    command: ['resume', 'rs'],
    description: '- 가장 최근 노래를 다시 재생합니다.',
    type: ['음악'],
    async execute(message) {
        if (!message.guild) {
            return message.reply('사용이 불가능한 채널입니다.'); // 그룹톡 여부 체크
        }

        const queue = client.queues.get(message.guild.id);
        if (!queue?.connection.dispatcher) {
            return message.reply('재생 중인 노래가 없습니다.');
        }
        if (!canModifyQueue(message.member)) {
            return message.reply(`같은 음성 채널에 참가해주세요! (${client.user})`);
        }

        if (!queue.playing) {
            queue.playing = true;
            queue.connection.dispatcher.resume();
            return message.channel.send(`${message.author} ▶ 노래를 다시 틀었습니다.`);
        }

        return message.reply('대기열이 일시정지 상태가 아닙니다.');
    }
};
