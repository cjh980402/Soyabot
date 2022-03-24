import { MessageAttachment } from 'discord.js';
import { PREFIX } from '../soyabot_config.js';
import { exec } from '../admin/admin_function.js';
import { MapleUser } from '../util/maple_parsing.js';

export const usage = `${PREFIX}컬렉션 (닉네임)`;
export const command = ['컬렉션', 'ㅋㄹㅅ', 'ㅋㄽ'];
export const description = '- 캐릭터의 maple.GG 코디 컬렉션을 출력합니다.';
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length !== 1) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }

    const mapleUserInfo = new MapleUser(args[0]);
    if (!(await mapleUserInfo.homeLevel())) {
        return message.channel.send(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
    }
    if (!(await mapleUserInfo.isLatest())) {
        message.channel.send('제한시간 내에 갱신 작업을 실패했습니다.');
    }

    const collection = mapleUserInfo.Collection();
    if (!collection) {
        return message.channel.send(`${mapleUserInfo.Name}님의 코디 컬렉션을 가져오지 못했습니다.`);
    } else {
        const { stdout: collectionPic } = await exec(
            `python3 ./util/maple_coordi_collection.py ${collection[0].length} ${collection[0].join(
                ' '
            )} ${collection[1].join(' ')}`,
            {
                encoding: 'buffer'
            }
        );
        const image = new MessageAttachment(collectionPic, 'collection.png');
        return message.channel.send({ content: `${mapleUserInfo.Name}님의 코디 컬렉션`, files: [image] });
    }
}
export const commandData = {
    name: '컬렉션',
    description: '캐릭터의 maple.GG 코디 컬렉션을 출력합니다.',
    options: [
        {
            name: '닉네임',
            type: 'STRING',
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
        await interaction.editReply('제한시간 내에 갱신 작업을 실패했습니다.');
    }

    const collection = mapleUserInfo.Collection();
    if (!collection) {
        return interaction.followUp(`${mapleUserInfo.Name}님의 코디 컬렉션을 가져오지 못했습니다.`);
    } else {
        const { stdout: collectionPic } = await exec(
            `python3 ./util/maple_coordi_collection.py ${collection[0].length} ${collection[0].join(
                ' '
            )} ${collection[1].join(' ')}`,
            {
                encoding: 'buffer'
            }
        );
        const image = new MessageAttachment(collectionPic, 'collection.png');
        return interaction.followUp({ content: `${mapleUserInfo.Name}님의 코디 컬렉션`, files: [image] });
    }
}
