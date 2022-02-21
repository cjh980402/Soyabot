import { CommandInteraction, Message } from 'discord.js';

export default function (messageOrInteraction) {
    if (
        !(messageOrInteraction instanceof Message || messageOrInteraction instanceof CommandInteraction) ||
        !messageOrInteraction.guildId
    ) {
        return;
    }
    const senderKey = `${messageOrInteraction.guildId} ${
        (messageOrInteraction.author ?? messageOrInteraction.user).id
    }`;
    const messagestat = db.get('SELECT * FROM messagedb WHERE channelsenderid = ?', [senderKey]);
    const content = messageOrInteraction.toString();
    db.replace('messagedb', {
        channelsenderid: senderKey,
        messagecnt: (messagestat?.messagecnt ?? 0) + 1,
        lettercnt: (messagestat?.lettercnt ?? 0) + content.replace(/[\s\u2007\u200b\u202d\u3164]/g, '').length,
        lastmessage: content
    });
}
