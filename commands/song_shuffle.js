import { canModifyQueue } from '../util/soyabot_util.js';
import { Util } from '../util/Util.js';

export const type = '음악';
export const commandData = {
    name: 'shuffle',
    description: '대기열 순서를 랜덤하게 섞어줍니다.'
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

    Util.shuffle(queue.songs, 1); // 첫번째 노래를 제외하고 섞기
    await interaction.followUp(`${interaction.user} 🔀 대기열을 섞었습니다.`);
}
