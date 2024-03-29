import { ApplicationCommandOptionType } from 'discord.js';
import { canModifyQueue } from '../util/soyabot_util.js';
import { Util } from '../util/Util.js';

export const type = '음악';
export const commandData = {
    name: 'remove',
    description: '대기열에서 지정한 노래를 삭제합니다. (,로 구분하여 여러 노래 삭제 가능)',
    options: [
        {
            name: '대기열_번호',
            type: ApplicationCommandOptionType.String,
            description: '삭제할 노래의 번호',
            required: true
        }
    ]
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
    if (queue.songs.length < 2) {
        return interaction.followUp('현재 대기열에서 삭제할 수 있는 노래가 없습니다.');
    }

    const songRemove = Util.deduplication(interaction.options.getString('대기열_번호').split(',').map(Math.trunc));
    if (songRemove.every((v) => !isNaN(v) && 2 <= v && v <= queue.songs.length)) {
        const removed = songRemove.map((v) => queue.songs[v - 1]);
        queue.songs = queue.songs.filter((_, i) => !songRemove.includes(i + 1));

        await interaction.followUp(
            `❌ ${interaction.user}가 대기열에서\n${removed
                .map((song, i) => `**${songRemove[i]}. ${song.title}**`)
                .join('\n')}\n을 삭제했습니다.`
        );
    } else {
        await interaction.followUp(`현재 대기열에서 2 ~ ${queue.songs.length}번째 노래를 삭제할 수 있습니다.`);
    }
}
