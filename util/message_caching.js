const { CommandInteraction, Message } = require('./discord.js-extend');

module.exports = function (messageOrInteraction) {
    if (messageOrInteraction instanceof Message) {
        if (!messageOrInteraction.guildId) {
            return;
        }
        const senderKey = `${messageOrInteraction.guildId} ${messageOrInteraction.author.id}`;
        const messagestat = db.get('SELECT * FROM messagedb WHERE channelsenderid = ?', [senderKey]);
        db.replace('messagedb', {
            channelsenderid: senderKey,
            messagecnt: (messagestat?.messagecnt ?? 0) + 1,
            lettercnt: (messagestat?.lettercnt ?? 0) + messageOrInteraction.content.replace(/[\s\u2007\u200b\u202d\u3164]/g, '').length,
            lastmessage: messageOrInteraction.content
        });
    } else if (messageOrInteraction instanceof CommandInteraction) {
        if (!messageOrInteraction.guildId) {
            return;
        }
        const senderKey = `${messageOrInteraction.guildId} ${messageOrInteraction.user.id}`;
        const messagestat = db.get('SELECT * FROM messagedb WHERE channelsenderid = ?', [senderKey]);
        const content = `/${messageOrInteraction.commandName}${messageOrInteraction.options._hoistedOptions.map((v) => ` ${v.value}`).join('')}`;
        db.replace('messagedb', {
            channelsenderid: senderKey,
            messagecnt: (messagestat?.messagecnt ?? 0) + 1,
            lettercnt: (messagestat?.lettercnt ?? 0) + content.replace(/[\s\u2007\u200b\u202d\u3164]/g, '').length,
            lastmessage: content
        });
    }
};
