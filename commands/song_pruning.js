export const usage = `${client.prefix}pruning`;
export const command = ['pruning', 'pr'];
export const description = '- 봇의 음악 메시지 자동정리 기능 상태를 전환합니다.';
export const type = ['음악'];
export async function messageExecute(message) {
    if (!message.guildId) {
        return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    if (db.get('SELECT * FROM pruningskip WHERE channelid = ?', [message.guildId])) {
        // 기존상태: OFF
        db.run('DELETE FROM pruningskip WHERE channelid = ?', [message.guildId]);
        return message.channel.send('현재 메시지 자동정리: **OFF → ON**');
    } else {
        // 기존상태: ON
        db.insert('pruningskip', { channelid: message.guildId, name: message.guild.name });
        return message.channel.send('현재 메시지 자동정리: **ON → OFF**');
    }
}
export const commandData = {
    name: 'pruning',
    description: '봇의 음악 메시지 자동정리 기능 상태를 전환합니다.'
};
export async function commandExecute(interaction) {
    if (!interaction.guildId) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    if (db.get('SELECT * FROM pruningskip WHERE channelid = ?', [interaction.guildId])) {
        // 기존상태: OFF
        db.run('DELETE FROM pruningskip WHERE channelid = ?', [interaction.guildId]);
        return interaction.followUp('현재 메시지 자동정리: **OFF → ON**');
    } else {
        // 기존상태: ON
        db.insert('pruningskip', { channelid: interaction.guildId, name: interaction.guild.name });
        return interaction.followUp('현재 메시지 자동정리: **ON → OFF**');
    }
}
