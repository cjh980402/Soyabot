export const type = '음악';
export const commandData = {
    name: 'pruning',
    description: '봇의 음악 메시지 자동정리 기능 상태를 전환합니다.'
};
export async function commandExecute(interaction) {
    if (!interaction.inGuild()) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    if (interaction.client.db.get('SELECT * FROM pruning_skip WHERE guild_id = ?', interaction.guildId)) {
        // 기존상태: OFF
        interaction.client.db.run('DELETE FROM pruning_skip WHERE guild_id = ?', interaction.guildId);
        await interaction.followUp('현재 메시지 자동정리: **OFF → ON**');
    } else {
        // 기존상태: ON
        interaction.client.db.insert('pruning_skip', { guild_id: interaction.guildId, name: interaction.guild.name });
        await interaction.followUp('현재 메시지 자동정리: **ON → OFF**');
    }
}
