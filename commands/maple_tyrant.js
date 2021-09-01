export const usage = `${client.prefix}타일런트`;
export const command = ['타일런트', 'ㅌㅇㄹㅌ', 'ㅌㅇㄾ'];
export const description = '- 타일런트 장비의 스타포스 강화 능력치를 출력합니다.';
export const type = ['메이플'];
export async function messageExecute(message) {
    return message.channel.send({ content: '타일런트 스타포스 강화 능력치 표', files: ['./pictures/tyrant.png'] });
}
export const commandData = {
    name: '타일런트',
    description: '타일런트 장비의 스타포스 강화 능력치를 출력합니다.'
};
export async function commandExecute(interaction) {
    return interaction.followUp({ content: '타일런트 스타포스 강화 능력치 표', files: ['./pictures/tyrant.png'] });
}
