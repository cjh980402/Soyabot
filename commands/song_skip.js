const { canModifyQueue } = require('../util/soyabot_util');

module.exports = {
    usage: `${client.prefix}skip`,
    command: ['skip'],
    description: '- 지금 재생 중인 노래 건너뜁니다.',
    type: ['음악'],
    async execute(message) {
        if (!message.guild) {
            return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
        }

        const queue = client.queues.get(message.guild.id);
        if (!queue?.connection.dispatcher) {
            return message.reply('재생 중인 노래가 없습니다.');
        }
        if (!canModifyQueue(message.member)) {
            return message.reply(`${client.user}과 같은 음성 채널에 참가해주세요!`);
        }

        message.channel.send(`${message.author} ⏭ 노래를 건너뛰었습니다.`);
        queue.playing = true;
        queue.connection.dispatcher.end();
    }
};
