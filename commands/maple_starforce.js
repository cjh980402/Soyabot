export const type = '메이플';
export const commandData = {
    name: '스타포스',
    description: '130 ~ 200제 일반 장비의 스타포스 누적 능력치를 출력합니다. (135제는 130제 템과 동일한 능력치)'
};
export async function commandExecute(interaction) {
    await interaction.followUp({
        content: '일반 장비의 스타포스 누적 능력치 표',
        files: ['./pictures/starforce.png']
    });
}
