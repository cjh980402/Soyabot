import { PREFIX } from '../soyabot_config.js';

export const usage = `${PREFIX}놀장강`;
export const command = ['놀장강', 'ㄴㅈㄱ', 'ㄵㄱ'];
export const description = '- 일반 장비의 놀장강 강화 능력치를 출력합니다.';
export const type = ['메이플'];
export async function messageExecute(message) {
    return message.channel.send({ content: '놀장강 강화 능력치 표', files: ['./pictures/noljang.png'] });
}
export const commandData = {
    name: '놀장강',
    description: '일반 장비의 놀장강 강화 능력치를 출력합니다.'
};
export async function commandExecute(interaction) {
    return interaction.followUp({ content: '놀장강 강화 능력치 표', files: ['./pictures/noljang.png'] });
}
