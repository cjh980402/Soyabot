import { canModifyQueue } from '../util/soyabot_util.js';

export const usage = `${client.prefix}stop`;
export const command = ['stop'];
export const description = '- 지금 재생 중인 노래를 정지하고 대기열을 비웁니다.';
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

    message.channel.send(`${message.author} ⏹️ 노래를 정지했습니다.`);
    queue.clearStop();
}
export const commandData = {
    name: 'stop',
    description: '지금 재생 중인 노래를 정지하고 대기열을 비웁니다.'
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

    interaction.followUp(`${interaction.user} ⏹️ 노래를 정지했습니다.`);
    queue.clearStop();
}
