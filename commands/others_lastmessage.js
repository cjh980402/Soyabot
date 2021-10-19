export const usage = `${client.prefix}최근챗 (멘션)`;
export const command = ['최근챗', 'ㅊㄱㅊ'];
export const channelCool = true;
export const type = ['기타'];
export async function messageExecute(message) {
    if (!message.guildId) {
        return message.reply('사용이 불가능한 채널입니다.');
    }

    let targetInfo;
    if (message.mentions.users.size > 0) {
        try {
            targetInfo = await message.guild.members.fetch({ user: message.mentions.users.first().id, cache: false });
        } catch {
            return message.channel.send('서버에 존재하지 않는 사람입니다.');
        }
    } else {
        targetInfo = message.member;
    }

    const messagestat = db.get('SELECT * FROM messagedb WHERE channelsenderid = ?', [
        `${message.guildId} ${targetInfo.user.id}`
    ]);
    if (messagestat) {
        return message.channel.send(
            `${targetInfo.nickname ?? targetInfo.user.username}의 최근 채팅\n채팅 내용: ${
                messagestat.lastmessage
            }\n${new Date(messagestat.lasttime).toLocaleString()}`
        );
    } else {
        return message.channel.send(`${targetInfo.nickname ?? targetInfo.user.username}의 채팅기록이 없습니다.`);
    }
}
