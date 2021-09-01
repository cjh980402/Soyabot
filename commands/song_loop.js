import { canModifyQueue } from '../util/soyabot_util.js';

export const usage = `${client.prefix}loop`;
export const command = ['loop', 'l'];
export const description = '- 반복 재생 상태를 전환합니다.';
export const type = ['음악'];
export async function messageExecute(message) {
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

    queue.loop = !queue.loop; // 반복 재생 상태 전환
    return message.channel.send(`현재 반복 재생 상태: ${queue.loop ? '**ON**' : '**OFF**'}`);
}
export const commandData = {
    name: 'loop',
    description: '반복 재생 상태를 전환합니다.'
};
export async function commandExecute(interaction) {
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

    queue.loop = !queue.loop; // 반복 재생 상태 전환
    return interaction.followUp(`현재 반복 재생 상태: ${queue.loop ? '**ON**' : '**OFF**'}`);
}
