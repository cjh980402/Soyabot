import { PREFIX } from '../soyabot_config.js';
import { canModifyQueue } from '../util/soyabot_util.js';

export const usage = `${PREFIX}skip`;
export const command = ['skip'];
export const description = '- 지금 재생 중인 노래 건너뜁니다.';
export const type = ['음악'];
export async function messageExecute(message) {
    if (!message.guildId) {
        return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    const queue = message.client.queues.get(message.guildId);
    if (!queue?.player.state.resource) {
        return message.reply('재생 중인 노래가 없습니다.');
    }
    if (!canModifyQueue(message.member)) {
        return message.reply(`${message.client.user}과 같은 음성 채널에 참가해주세요!`);
    }

    message.channel.send(`${message.author} ⏭️ 노래를 건너뛰었습니다.`);
    queue.player.stop();
}
export const commandData = {
    name: 'skip',
    description: '지금 재생 중인 노래 건너뜁니다.'
};
export async function commandExecute(interaction) {
    if (!interaction.guildId) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    const queue = interaction.client.queues.get(interaction.guildId);
    if (!queue?.player.state.resource) {
        return interaction.followUp('재생 중인 노래가 없습니다.');
    }
    if (!canModifyQueue(interaction.member)) {
        return interaction.followUp(`${interaction.client.user}과 같은 음성 채널에 참가해주세요!`);
    }

    interaction.followUp(`${interaction.user} ⏭️ 노래를 건너뛰었습니다.`);
    queue.player.stop();
}
