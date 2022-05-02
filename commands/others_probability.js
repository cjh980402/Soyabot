import { ApplicationCommandOptionType } from 'discord.js';

export const type = '기타';
export const commandData = {
    name: '확률',
    description: '봇이 내용에 따른 확률을 말해줍니다.',
    options: [
        {
            name: '내용',
            type: ApplicationCommandOptionType.String,
            description: '봇이 확률을 말해줄 내용'
        }
    ]
};
export async function commandExecute(interaction) {
    await interaction.followUp(`확률: ${Math.floor(Math.random() * 101)}%`);
}
