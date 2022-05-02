import { ApplicationCommandOptionType } from 'discord.js';
// import { canModifyQueue } from '../util/soyabot_util.js';

export const type = '음악';
export const commandData = {
    name: 'volume',
    description: '지금 재생 중인 노래의 음량(0 ~ 100 범위)을 변경합니다. 음량을 생략 시 현재 음량을 알려줍니다.',
    options: [
        {
            name: '변경할_음량',
            type: ApplicationCommandOptionType.Number,
            description: '새로 설정할 봇의 음량 수치',
            min_value: 0,
            max_value: 100
        }
    ]
};
export async function commandExecute(interaction) {
    if (!interaction.guildId) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }
    await interaction.followUp('현재 메모리 이슈로 인해 볼륨 조절 기능은 사용할 수 없습니다.');

    /*const queue = interaction.client.queues.get(interaction.guildId);
    if (!queue?.player.state.resource) {
        return interaction.followUp('재생 중인 노래가 없습니다.');
    }
    if (!canModifyQueue(interaction.member)) {
        return interaction.followUp(`${interaction.client.user}과 같은 음성 채널에 참가해주세요!`);
    }

    const volume = interaction.options.getNumber('변경할_음량');
    if (volume === null) {
        return interaction.followUp(`🔊 현재 음량: **${queue.volume}%**`);
    }

    queue.volume = volume;
    queue.player.state.resource.volume.setVolume(queue.volume / 100);
    await interaction.followUp(`변경된 음량: **${queue.volume}%**`);*/
}
