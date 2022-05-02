import { canModifyQueue } from '../util/soyabot_util.js';

export const type = '음악';
export const commandData = {
    name: 'resume',
    description: '가장 최근 노래를 다시 재생합니다.'
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

    if (!queue.playing) {
        queue.player.unpause();
        await interaction.followUp(`${interaction.user} ▶ 노래를 다시 틀었습니다.`);
    } else {
        await interaction.followUp('대기열이 일시정지 상태가 아닙니다.');
    }
}
