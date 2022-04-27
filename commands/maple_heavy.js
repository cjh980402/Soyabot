import { ApplicationCommandOptionType } from 'discord.js';
import { MapleUser } from '../classes/MapleParser.js';

export const type = ['메이플'];
export const commandData = {
    name: '헤비',
    description: '헤비...',
    options: [
        {
            name: '닉네임',
            type: ApplicationCommandOptionType.String,
            description: '캐릭터의 닉네임',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const mapleUserInfo = new MapleUser(interaction.options.getString('닉네임'));

    const rslt = await mapleUserInfo.homeLevel();
    if (!rslt) {
        return interaction.followUp(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
    }

    if (rslt[4] === '제로' || /^매일.*승리$|현지|소현|김(헤(하|비)|데렐라|소헌지)/.test(mapleUserInfo.Name)) {
        await interaction.followUp(`'${mapleUserInfo.Name}'님은 뉴비 유저입니다. ${rslt[4]}조아.`);
    } else {
        await interaction.followUp(`${rslt[4]}조아.\n그렇지만 '${mapleUserInfo.Name}'님은 너무 무겁습니다!`);
    }
}
