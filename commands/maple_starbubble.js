import { ApplicationCommandOptionType } from 'discord.js';

export const type = ['메이플'];
export const commandData = {
    name: '스타버블',
    description: `엔젤릭버스터의 2번째 노래`
};
export async function commandExecute(interaction) {
    interaction.options._hoistedOptions.push({
        name: '영상_주소_제목',
        type: ApplicationCommandOptionType.String,
        value: 'https://youtu.be/ixww1OHztbs'
    });
    await interaction.client.commands.get('play').commandExecute(interaction);
}
