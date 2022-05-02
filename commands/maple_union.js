import { ApplicationCommandOptionType } from 'discord.js';
import { MapleUser } from '../classes/MapleParser.js';

export const type = '메이플';
export const commandData = {
    name: '유니온',
    description: '캐릭터의 유니온 정보와 일일 코인 수급량을 출력합니다.',
    options: [
        {
            name: '닉네임',
            type: ApplicationCommandOptionType.String,
            description: '유니온 정보를 검색할 캐릭터의 닉네임',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const mapleUserInfo = new MapleUser(interaction.options.getString('닉네임'));

    const union = await mapleUserInfo.homeUnion();
    if (!union) {
        await interaction.followUp(`[${mapleUserInfo.Name}]\n존재하지 않거나 월드 내 최고 레벨이 아닌 캐릭터입니다.`);
    } else {
        await interaction.followUp(
            `[${mapleUserInfo.Name}]\n직업: ${
                union[3]
            }\n유니온 레벨: ${union[0].toLocaleString()}\n전투력: ${union[1].toLocaleString()}\n일일 코인 수급량: ${
                union[2]
            }`
        );
    }
}
