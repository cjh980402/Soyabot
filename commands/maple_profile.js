import { AttachmentBuilder, ApplicationCommandOptionType } from 'discord.js';
import { exec } from '../admin/admin_function.js';
import { MapleUser } from '../classes/MapleParser.js';

export const type = '메이플';
export const commandData = {
    name: '프로필',
    description: '캐릭터의 maple.GG 프로필을 출력합니다.',
    options: [
        {
            name: '닉네임',
            type: ApplicationCommandOptionType.String,
            description: '프로필을 출력할 캐릭터의 닉네임',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const mapleUserInfo = new MapleUser(interaction.options.getString('닉네임'));

    const level = await mapleUserInfo.homeLevel();
    if (!level) {
        return interaction.followUp(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
    }
    if (!(await mapleUserInfo.isLatest())) {
        await interaction.followUp('제한시간 내에 갱신 작업을 실패했습니다.');
    }

    const rank = mapleUserInfo.Rank();
    const rankString = rank ? `월드 ${rank[3].toLocaleString()}위 (전체 ${rank[2].toLocaleString()}위)` : ' ';
    const murung = mapleUserInfo.Murung();
    const union = mapleUserInfo.Union();
    const seed = mapleUserInfo.Seed();

    const { stdout: profilePic } = await exec(
        `python3 ./util/python/maple_gg_profile.py ${mapleUserInfo.userImg(false)} ${
            mapleUserInfo.Name
        } ${mapleUserInfo.serverName()} ${level[0]} '${
            level[4]
        }' ${mapleUserInfo.serverImg()} ${level[2].toLocaleString()} '${level[3] || '(없음)'}' '${rankString}' '${
            murung ? `${murung[2]}층` : '기록없음'
        }' '${murung ? `${Math.floor(murung[3] / 60)}분 ${murung[3] % 60}초` : ' '}' '${
            union ? union[3] : '기록없음'
        }' '${union ? `Lv.${union[0].toLocaleString()}` : ' '}' '${seed ? `${seed[2]}층` : '기록없음'}' '${
            seed ? `${Math.floor(seed[3] / 60)}분 ${seed[3] % 60}초` : ' '
        }'`,
        { encoding: 'buffer' }
    );
    const image = new AttachmentBuilder(profilePic, { name: 'profile.png' });
    await interaction.followUp({ content: `${mapleUserInfo.Name}님의 프로필`, files: [image] });
}
