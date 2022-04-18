import { PREFIX } from '../soyabot_config.js';

export const usage = `${PREFIX}스타버블`;
export const command = ['스타버블', 'ㅅㅌㅂㅂ'];
export const description = '- 엔젤릭버스터의 2번째 노래';
export const type = ['메이플'];
export async function messageExecute(message) {
    await message.client.commands
        .find((cmd) => cmd.command.includes('play'))
        .messageExecute(message, ['https://youtu.be/ixww1OHztbs']);
}
export const commandData = {
    name: '스타버블',
    description: `엔젤릭버스터의 2번째 노래`
};
export async function commandExecute(interaction) {
    interaction.options._hoistedOptions.push({
        name: '영상_주소_제목',
        type: 'STRING',
        value: 'https://youtu.be/ixww1OHztbs'
    });
    await interaction.client.commands.find((cmd) => cmd.commandData?.name === 'play').commandExecute(interaction);
}
