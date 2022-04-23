import { PREFIX } from '../soyabot_config.js';

export const usage = `${PREFIX}확률 (내용)`;
export const command = ['확률', 'ㅎㄹ'];
export const description = '- 봇이 내용에 따른 확률을 말해줍니다.';
export const type = ['기타'];
export async function messageExecute(message) {
    await message.reply(`확률: ${Math.floor(Math.random() * 101)}%`);
}
export const commandData = {
    name: '확률',
    description: '봇이 내용에 따른 확률을 말해줍니다.',
    options: [
        {
            name: '내용',
            type: 'STRING',
            description: '봇이 확률을 말해줄 내용'
        }
    ]
};
export async function commandExecute(interaction) {
    await interaction.followUp(`확률: ${Math.floor(Math.random() * 101)}%`);
}
