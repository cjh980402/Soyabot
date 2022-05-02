import { Attachment, ApplicationCommandOptionType } from 'discord.js';
import { exec } from '../admin/admin_function.js';
import { MapleUser } from '../classes/MapleParser.js';

export const type = '메이플';
export const commandData = {
    name: '컬렉션',
    description: '캐릭터의 maple.GG 코디 컬렉션을 출력합니다.',
    options: [
        {
            name: '닉네임',
            type: ApplicationCommandOptionType.String,
            description: '컬렉션을 출력할 캐릭터의 닉네임',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const mapleUserInfo = new MapleUser(interaction.options.getString('닉네임'));

    if (!(await mapleUserInfo.homeLevel())) {
        return interaction.followUp(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
    }
    if (!(await mapleUserInfo.isLatest())) {
        await interaction.followUp('제한시간 내에 갱신 작업을 실패했습니다.');
    }

    const collection = mapleUserInfo.Collection();
    if (!collection) {
        await interaction.followUp(`${mapleUserInfo.Name}님의 코디 컬렉션을 가져오지 못했습니다.`);
    } else {
        const { stdout: collectionPic } = await exec(
            `python3 ./util/python/maple_coordi_collection.py ${collection[0].length} ${collection[0].join(
                ' '
            )} ${collection[1].join(' ')}`,
            {
                encoding: 'buffer'
            }
        );
        const image = new Attachment(collectionPic, 'collection.png');
        await interaction.followUp({ content: `${mapleUserInfo.Name}님의 코디 컬렉션`, files: [image] });
    }
}
