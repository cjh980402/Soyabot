export const type = ['메이플'];
export const commandData = {
    name: '놀장강',
    description: '일반 장비의 놀장강 강화 능력치를 출력합니다.'
};
export async function commandExecute(interaction) {
    await interaction.followUp({ content: '놀장강 강화 능력치 표', files: ['./pictures/noljang.png'] });
}
