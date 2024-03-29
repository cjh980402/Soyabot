import { ApplicationCommandOptionType } from 'discord.js';
import { FormData, request } from 'undici';
import { sendSplitCode } from '../util/soyabot_util.js';
import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET } from '../soyabot_config.js';

async function requestCFR(url) {
    const form = new FormData();
    const { body: imageBody } = await request(url);
    form.set('image', await imageBody.blob());

    const { body } = await request('https://openapi.naver.com/v1/vision/face', {
        method: 'POST',
        headers: {
            'X-Naver-Client-Id': NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
        },
        body: form
    });
    return body.json();
}

async function clova_face(url) {
    const data = await requestCFR(url);
    if (!data.info) {
        return `사진 분석에 실패했습니다.\n${data.errorMessage}`;
    }

    let rslt = `감지된 얼굴 수: ${data.info.faceCount}`;
    if (data.faces.length) {
        rslt += `\n\n${data.faces
            .map(
                (person, i) => `${i + 1}번째 얼굴 분석  (X = ${person.roi.x}, Y = ${person.roi.y})
성별: ${person.gender.value} (신뢰도: ${(person.gender.confidence * 100).toFixed(2)}%)
나이: ${person.age.value} (신뢰도: ${(person.age.confidence * 100).toFixed(2)}%)
감정: ${person.emotion.value} (신뢰도: ${(person.emotion.confidence * 100).toFixed(2)}%)
포즈: ${person.pose.value} (신뢰도: ${(person.pose.confidence * 100).toFixed(2)}%)`
            )
            .join('\n\n')}\n\n위치 기준점(X = 0, Y = 0): 좌측상단`;
    }
    return rslt;
}

export const type = '기타';
export const commandData = {
    name: '얼굴인식',
    description: '인물 사진과 함께 명령어를 사용하면 얼굴을 분석한 후 성별, 나이 등을 알려줍니다.',
    options: [
        {
            name: '사진',
            type: ApplicationCommandOptionType.Attachment,
            description: '얼굴을 분석할 인물 사진',
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
        await sendSplitCode(interaction, await clova_face(imageURL), { split: true });
    }
}
