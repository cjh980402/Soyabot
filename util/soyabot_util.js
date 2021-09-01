export function canModifyQueue (member) {
    const botChannelId = member.guild.me.voice.channelId;
    return !botChannelId || botChannelId === member.voice.channelId; // 봇이 참가한 음성채널과 다른 경우 false 반환
}

export async function getMessageImage (message) {
    if (message.reference) {
        message = await message.fetchReference();
    }
    return message?.attachments.first()?.height ? message.attachments.first().url : null;
}
