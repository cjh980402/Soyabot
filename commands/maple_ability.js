export const type = '메이플';
export const commandData = {
    name: '어빌리티',
    description: '레어 ~ 레전드리 어빌리티의 능력치를 표로 보여줍니다.'
};
export async function commandExecute(interaction) {
    await interaction.followUp({ content: '어빌리티 능력치 표', files: ['./pictures/ability.png'] });
}
