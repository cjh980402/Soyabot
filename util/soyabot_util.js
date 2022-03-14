export function commandCount(db, commandName) {
    try {
        const data = db.get('SELECT * FROM commanddb WHERE commandname = ?', [commandName]);
        db.replace('commanddb', {
            commandname: commandName,
            count: (data?.count ?? 0) + 1
        });
    } catch (err) {
        console.error(err);
    }
}

export function canModifyQueue(member) {
    const botChannelId = member.guild.me.voice.channelId;
    if (!botChannelId) {
        throw new Error('봇이 음성채널에 참가하지 않은 상태입니다.');
    }
    return botChannelId === member.voice.channelId; // 봇이 참가한 음성채널과 다른 경우 false 반환
}

export async function getMessageImage(message) {
    if (message.reference) {
        message = await message.fetchReference();
    }
    return message.attachments.first()?.height ? message.attachments.first().url : null;
}
