export const name = 'voiceStateUpdate';
export function listener(oldState, newState) {
    try {
        if (oldState.channelId !== newState.channelId) {
            if (newState.channelId) {
                const queue = newState.client.queues.get(newState.guild.id);
                if (
                    queue?.player.state.resource &&
                    !queue.playing &&
                    newState.channelId === queue.voiceChannel.id &&
                    newState.channel.members.filter((v) => !v.user.bot).size === 1
                ) {
                    // 봇만 있던 음성 채널에 1명이 새로 들어온 경우
                    queue.deleteLeave();
                    queue.player.unpause();
                    queue.sendMessage('대기열을 다시 재생합니다.');
                }
            }

            if (oldState.channelId) {
                const queue = oldState.client.queues.get(oldState.guild.id);
                if (oldState.id === oldState.client.user.id) {
                    queue?.clearStop(); // 봇의 음성 채널에 변동이 있는 경우 바로 종료
                } else if (
                    queue?.player.state.resource &&
                    oldState.channelId === queue.voiceChannel.id &&
                    oldState.channel?.members.filter((v) => !v.user.bot).size === 0
                ) {
                    // 봇만 음성 채널에 있는 경우
                    if (queue.playing) {
                        queue.player.pause();
                        queue.sendMessage('모든 사용자가 음성채널을 떠나서 대기열을 일시정지합니다.');
                    }
                    queue.setLeave();
                }
            }
        }
    } catch {}
}
