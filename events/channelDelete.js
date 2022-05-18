export const name = 'channelDelete';
export function listener(channel) {
    if (channel.isVoiceBased()) {
        const queue = channel.client.queues.get(channel.guildId);
        if (channel.id === queue?.voiceChannel.id) {
            queue.clearStop(); // 봇이 참가한 음성 채널이 삭제된 경우 바로 종료
        }
    }
}
