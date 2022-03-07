import { canModifyQueue } from '../util/soyabot_util.js';

export const usage = `${client.prefix}shuffle`;
export const command = ['shuffle', 'shf'];
export const description = '- 대기열 순서를 랜덤하게 섞어줍니다.';
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

    queue.songs.shuffle(1); // 첫번째 노래를 제외하고 섞기
    return message.channel.send(`${message.author} 🔀 대기열을 섞었습니다.`);
}
export const commandData = {
    name: 'shuffle',
    description: '대기열 순서를 랜덤하게 섞어줍니다.'
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

    queue.songs.shuffle(1); // 첫번째 노래를 제외하고 섞기
    return interaction.followUp(`${interaction.user} 🔀 대기열을 섞었습니다.`);
}
