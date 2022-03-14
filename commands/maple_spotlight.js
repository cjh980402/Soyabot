import { PREFIX } from '../soyabot_config.js';

export const usage = `${PREFIX}스포트라이트`;
export const command = ['스포트라이트', 'ㅅㅍㅌㄹㅇㅌ'];
export const description = '- 엔젤릭버스터의 1번째 노래';
export const type = ['메이플'];
export async function messageExecute(message) {
    return message.client.commands
        .find((cmd) => cmd.command.includes('play'))
        .messageExecute(message, ['https://youtu.be/2cLhHDXAdxI']);
}
export const commandData = {
    name: '스포트라이트',
    description: `엔젤릭버스터의 1번째 노래`
};
export async function commandExecute(interaction) {
    interaction.options._hoistedOptions.push({
        name: '영상_주소_제목',
        type: 'STRING',
        value: 'https://youtu.be/2cLhHDXAdxI'
    });
    return interaction.client.commands.find((cmd) => cmd.commandData?.name === 'play').commandExecute(interaction);
}
