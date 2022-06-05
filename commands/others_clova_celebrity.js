import { ApplicationCommandOptionType } from 'discord.js';
import { FormData, request } from 'undici';
import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET } from '../soyabot_config.js';

async function requestCFR(url) {
    const form = new FormData();
    const { body: imageBody } = await request(url);
    form.set('image', await imageBody.blob());

    const { body } = await request('https://openapi.naver.com/v1/vision/celebrity', {
        method: 'POST',
        headers: {
            'X-Naver-Client-Id': NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
        },
        body: form
    });
    return body.json();
}

async function clova_celebrity(url) {
    const data = await requestCFR(url);
    if (!data.info) {
        return `사진 분석에 실패했습니다.\n${data.errorMessage}`;
    }

    let rslt = `닮은 유명인 수: ${data.info.faceCount}`;
    if (data.faces.length) {
        rslt += `\n${data.faces
            .map(
                (person) =>
                    `이름: ${person.celebrity.value} (신뢰도: ${(person.celebrity.confidence * 100).toFixed(2)}%)`
            )
            .join('\n')}`;
    }
    return rslt;
}

export const type = '기타';
export const commandData = {
    name: '닮은꼴',
    description: '인물 사진과 함께 명령어를 사용하면 얼굴을 분석한 후 닮은 유명인을 알려줍니다.',
    options: [
        {
            name: '사진',
            type: ApplicationCommandOptionType.Attachment,
            description: '닮은 유명인을 찾을 인물 사진',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const attachment = interaction.options.getAttachment('사진');
    const imageURL = attachment.height ? attachment.attachment : null;
    if (!imageURL) {
        await interaction.followUp('사진과 함께 명령어를 사용해주세요.');
    } else {
        await interaction.followUp(await clova_celebrity(imageURL));
    }
}
