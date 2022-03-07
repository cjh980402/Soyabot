import { canModifyQueue } from '../util/soyabot_util.js';

export const usage = `${client.prefix}pause`;
export const command = ['pause'];
export const description = '- 지금 재생 중인 노래를 일시정지합니다.';
export const type = ['음악'];
export async function messageExecute(message) {
    if (!message.guildId) {
        return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    const queue = client.queues.get(message.guildId);
    if (!queue?.player.state.resource) {
        return message.reply('재생 중인 노래가 없습니다.');
    }
    if (!canModifyQueue(message.member)) {
        return message.reply(`${client.user}과 같은 음성 채널에 참가해주세요!`);
    }

    if (queue.playing) {
        queue.player.pause();
        return message.channel.send(`${message.author} ⏸️ 노래를 일시정지 했습니다.`);
    }

    return message.reply('대기열이 재생 상태가 아닙니다.');
}
export const commandData = {
    name: 'pause',
    description: '지금 재생 중인 노래를 일시정지합니다.'
};
export async function commandExecute(interaction) {
    if (!interaction.guildId) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    const queue = client.queues.get(interaction.guildId);
    if (!queue?.player.state.resource) {
        return interaction.followUp('재생 중인 노래가 없습니다.');
    }
    if (!canModifyQueue(interaction.member)) {
        return interaction.followUp(`${client.user}과 같은 음성 채널에 참가해주세요!`);
    }

    if (queue.playing) {
        queue.player.pause();
        return interaction.followUp(`${interaction.user} ⏸️ 노래를 일시정지 했습니다.`);
    }

    return interaction.followUp('대기열이 재생 상태가 아닙니다.');
}
