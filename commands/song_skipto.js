import { ApplicationCommandOptionType } from 'discord.js';
import { canModifyQueue } from '../util/soyabot_util.js';

export const type = '음악';
export const commandData = {
    name: 'skipto',
    description: '번호로 선택한 대기열의 노래로 건너뜁니다.',
    options: [
        {
            name: '대기열_번호',
            type: ApplicationCommandOptionType.Integer,
            description: '재생 중인 노래를 건너뛰고 바로 재생할 노래의 대기열 번호',
            min_value: 2,
            required: true
        }
    ]
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
    if (queue.songs.length < 2) {
        return interaction.followUp('현재 대기열에서 건너뛸 수 있는 노래가 없습니다.');
    }

    const skipto = interaction.options.getInteger('대기열_번호');
    if (skipto > queue.songs.length) {
        return interaction.followUp(`현재 대기열에서 2 ~ ${queue.songs.length}번째 노래로 건너뛸 수 있습니다.`);
    }

    await interaction.followUp(`${interaction.user} ⏭️ ${skipto - 1}개의 노래를 건너뛰었습니다.`);
    if (queue.loop) {
        queue.songs.push(...queue.songs.splice(0, skipto - 2));
    } else {
        queue.songs.splice(0, skipto - 2);
    }
    queue.player.stop();
}
