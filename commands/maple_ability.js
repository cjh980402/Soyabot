import { PREFIX } from '../soyabot_config.js';

export const usage = `${PREFIX}어빌리티`;
export const command = ['어빌리티', 'ㅇㅂㄹㅌ', 'ㅇㅂㄾ'];
export const description = '- 레어 ~ 레전드리 어빌리티의 능력치를 표로 보여줍니다.';
export const type = ['메이플'];
export async function messageExecute(message) {
    return message.channel.send({ content: '어빌리티 능력치 표', files: ['./pictures/ability.png'] });
}
export const commandData = {
    name: '어빌리티',
    description: '레어 ~ 레전드리 어빌리티의 능력치를 표로 보여줍니다.'
};
export async function commandExecute(interaction) {
    return interaction.followUp({ content: '어빌리티 능력치 표', files: ['./pictures/ability.png'] });
}
