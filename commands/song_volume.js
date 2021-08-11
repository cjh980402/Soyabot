const { canModifyQueue } = require('../util/soyabot_util');

module.exports = {
    usage: `${client.prefix}volume (변경할 음량)`,
    command: ['volume', 'v'],
    description: '- 지금 재생 중인 노래의 음량(0 ~ 100 범위)을 변경합니다. 음량을 생략 시 현재 음량을 알려줍니다.',
    type: ['음악'],
    async messageExecute(message, args) {
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

        if (!args[0]) {
            return message.reply(`🔊 현재 음량: **${queue.volume}%**`);
        }
        if (isNaN(args[0])) {
            return message.reply('음량 변경을 위해 숫자를 사용해주세요.');
        }

        const volume = +args[0];
        if (volume > 100 || volume < 0) {
            return message.reply('0 ~ 100 범위의 음량만 가능합니다.');
        }

        queue.volume = volume;
        queue.subscription.player.state.resource.volume.setVolume(queue.volume / 100);
        return message.channel.send(`변경된 음량: **${queue.volume}%**`);
    },
    commandData: {
        name: 'volume',
        description: '지금 재생 중인 노래의 음량(0 ~ 100 범위)을 변경합니다. 음량을 생략 시 현재 음량을 알려줍니다.',
        options: [
            {
                name: '변경할_음량',
                type: 'NUMBER',
                description: '새로 설정할 봇의 음량 수치'
            }
        ]
    },
    async commandExecute(interaction) {
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

        const volume = interaction.options.getNumber('변경할_음량');
        if (volume === null) {
            return interaction.followUp(`🔊 현재 음량: **${queue.volume}%**`);
        }
        if (volume > 100 || volume < 0) {
            return interaction.followUp('0 ~ 100 범위의 음량만 가능합니다.');
        }

        queue.volume = volume;
        queue.subscription.player.state.resource.volume.setVolume(queue.volume / 100);
        return interaction.followUp(`변경된 음량: **${queue.volume}%**`);
    }
};
