import { canModifyQueue } from '../util/soyabot_util.js';

export const type = '음악';
export const commandData = {
    name: 'loop',
    description: '반복 재생 상태를 전환합니다.'
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

    queue.loop = !queue.loop; // 반복 재생 상태 전환
    await interaction.followUp(`현재 반복 재생 상태: ${queue.loop ? '**ON**' : '**OFF**'}`);
}
