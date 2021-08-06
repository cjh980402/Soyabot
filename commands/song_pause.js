const { canModifyQueue } = require('../util/soyabot_util');

module.exports = {
    usage: `${client.prefix}pause`,
    command: ['pause'],
    description: '- 지금 재생 중인 노래를 일시정지합니다.',
    type: ['음악'],
    async messageExecute(message) {
        if (!message.guildId) {
            return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
        }

        const queue = client.queues.get(message.guildId);
        if (!queue?.subscription.player.state.resource) {
            return message.reply('재생 중인 노래가 없습니다.');
        }
        if (!canModifyQueue(message.member)) {
            return message.reply(`${client.user}과 같은 음성 채널에 참가해주세요!`);
        }

        if (queue.playing) {
            queue.playing = false;
            queue.subscription.player.pause();
            return message.channel.send(`${message.author} ⏸ 노래를 일시정지 했습니다.`);
        }

        return message.reply('대기열이 재생 상태가 아닙니다.');
    },
    interaction: {
        name: 'pause',
        description: '지금 재생 중인 노래를 일시정지합니다.'
    },
    async interactionExecute(interaction) {
        if (!interaction.guildId) {
            return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
        }

        const queue = client.queues.get(interaction.guildId);
        if (!queue?.subscription.player.state.resource) {
            return interaction.followUp('재생 중인 노래가 없습니다.');
        }
        if (!canModifyQueue(interaction.member)) {
            return interaction.followUp(`${client.user}과 같은 음성 채널에 참가해주세요!`);
        }

        if (queue.playing) {
            queue.playing = false;
            queue.subscription.player.pause();
            return interaction.followUp(`${interaction.user} ⏸ 노래를 일시정지 했습니다.`);
        }

        return interaction.followUp('대기열이 재생 상태가 아닙니다.');
    }
};
