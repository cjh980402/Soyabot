import { AttachmentBuilder } from 'discord.js';

export const type = '기타';
export const commandData = {
    name: '미세먼지',
    description: '현재 한국의 미세먼지 현황을 보여줍니다.'
};
export async function commandExecute(interaction) {
    const image = new AttachmentBuilder(
        'https://www.airkorea.or.kr/web/placeInfo/getImgFile?scrinId=16600&Dx=D0&imageSn=1',
        { name: 'PM10.png' }
    );
    await interaction.followUp({ content: '미세먼지 (PM-10) 이미지', files: [image] });
}
