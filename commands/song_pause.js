import { canModifyQueue } from '../util/soyabot_util.js';

export const type = '음악';
export const commandData = {
    name: 'pause',
    description: '지금 재생 중인 노래를 일시정지합니다.'
};
export async function commandExecute(interaction) {
    if (!interaction.inGuild()) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    const queue = interaction.client.queues.get(interaction.guildId);
    if (!queue?.player.state.resource) {
        return interaction.followUp('재생 중인 노래가 없습니다.');
    }
    if (!canModifyQueue(interaction.member)) {
        return interaction.followUp(`${interaction.client.user}과 같은 음성 채널에 참가해주세요!`);
    }

    if (queue.playing) {
        queue.player.pause();
        await interaction.followUp(`${interaction.user} ⏸️ 노래를 일시정지 했습니다.`);
    } else {
        await interaction.followUp('대기열이 재생 상태가 아닙니다.');
    }
}
