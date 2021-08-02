const { canModifyQueue } = require('../util/soyabot_util');

module.exports = {
    usage: `${client.prefix}loop`,
    command: ['loop', 'l'],
    description: '- 반복 재생 상태를 전환합니다.',
    type: ['음악'],
    async messageExecute(message) {
        if (!message.guild) {
            return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
        }

        const queue = client.queues.get(message.guild.id);
        if (!queue?.audioPlayer.state.resource) {
            return message.reply('재생 중인 노래가 없습니다.');
        }
        if (!canModifyQueue(message.member)) {
            return message.reply(`${client.user}과 같은 음성 채널에 참가해주세요!`);
        }

        queue.loop = !queue.loop; // 반복 재생 상태 전환
        return message.channel.send(`현재 반복 재생 상태: ${queue.loop ? '**ON**' : '**OFF**'}`);
    },
    interaction: {
        name: 'loop',
        description: '반복 재생 상태를 전환합니다.'
    },
    async interactionExecute(interaction) {
        if (!interaction.guild) {
            return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
        }

        const queue = client.queues.get(interaction.guildId);
        if (!queue?.audioPlayer.state.resource) {
            return interaction.followUp('재생 중인 노래가 없습니다.');
        }
        if (!canModifyQueue(interaction.member)) {
            return interaction.followUp(`${client.user}과 같은 음성 채널에 참가해주세요!`);
        }

        queue.loop = !queue.loop; // 반복 재생 상태 전환
        return interaction.followUp(`현재 반복 재생 상태: ${queue.loop ? '**ON**' : '**OFF**'}`);
    }
};
