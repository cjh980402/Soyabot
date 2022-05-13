import { canModifyQueue } from '../util/soyabot_util.js';
import { Util } from '../util/Util.js';

export const name = 'interactionCreate';
export async function listener(interaction) {
    if (interaction.isButton()) {
        try {
            const queue = interaction.client.queues.get(interaction.guildId);
            if (queue?.playingMessage?.id !== interaction.message.id || !queue.player.state.resource) {
                return;
            }

            await interaction.deferUpdate(); // 버튼이 로딩 상태가 되었다가 원래대로 돌아옴
            if (!canModifyQueue(interaction.member)) {
                return queue.sendMessage(`${interaction.client.user}과 같은 음성 채널에 참가해주세요!`);
            }

            switch (interaction.customId) {
                case 'stop':
                    queue.sendMessage(`${interaction.user} ⏹️ 노래를 정지했습니다.`);
                    queue.clearStop();
                    break;
                case 'play_pause':
                    if (queue.playing) {
                        queue.player.pause();
                        queue.sendMessage(`${interaction.user} ⏸️ 노래를 일시정지 했습니다.`);
                    } else {
                        queue.player.unpause();
                        queue.sendMessage(`${interaction.user} ▶️ 노래를 다시 틀었습니다.`);
                    }
                    break;
                case 'skip':
                    queue.sendMessage(`${interaction.user} ⏭️ 노래를 건너뛰었습니다.`);
                    queue.player.stop();
                    break;
                case 'loop':
                    queue.loop = !queue.loop;
                    queue.sendMessage(`현재 반복 재생 상태: ${queue.loop ? '**ON**' : '**OFF**'}`);
                    break;
                case 'mute':
                    const muted = queue.voiceChannel.guild.members.me.voice.serverMute;
                    await queue.voiceChannel.guild.members.me.voice.setMute(!muted);
                    queue.sendMessage(
                        muted
                            ? `${interaction.user} 🔊 음소거를 해제했습니다.`
                            : `${interaction.user} 🔇 노래를 음소거 했습니다.`
                    );
                    break;
                case 'volume_down':
                    queue.sendMessage('현재 메모리 이슈로 인해 볼륨 조절 기능은 사용할 수 없습니다.');
                    /*queue.volume = Math.max(queue.volume - 10, 0);
                    queue.player.state.resource.volume.setVolume(queue.volume / 100);
                    queue.sendMessage(`${interaction.user} 🔉 음량을 낮췄습니다. 현재 음량: ${queue.volume}%`);*/
                    break;
                case 'volume_up':
                    queue.sendMessage('현재 메모리 이슈로 인해 볼륨 조절 기능은 사용할 수 없습니다.');
                    /*queue.volume = Math.min(queue.volume + 10, 100);
                    queue.player.state.resource.volume.setVolume(queue.volume / 100);
                    queue.sendMessage(`${interaction.user} 🔊 음량을 높였습니다. 현재 음량: ${queue.volume}%`);*/
                    break;
                case 'shuffle':
                    Util.shuffle(queue.songs, 1); // 첫번째 노래를 제외하고 섞기
                    queue.sendMessage(`${interaction.user} 🔀 대기열을 섞었습니다.`);
                    break;
            }
        } catch {}
    }
}
