import { FormData, request } from 'undici';
import { safelyExtractBody } from 'undici/lib/fetch/body.js';
import { getMessageImage } from '../util/soyabot_util.js';
import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, PREFIX } from '../soyabot_config.js';

async function requestCFR(url) {
    const form = new FormData();
    const { body: imageBody } = await request(url);
    form.set('image', await imageBody.blob());

    const [formBody, contentType] = safelyExtractBody(form);
    const { body } = await request('https://openapi.naver.com/v1/vision/celebrity', {
        method: 'POST',
        headers: {
            'X-Naver-Client-Id': NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
            'content-type': contentType
        },
        body: formBody.stream
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

export const usage = `${PREFIX}닮은꼴`;
export const command = ['닮은꼴', 'ㄷㅇㄲ'];
export const description = '- 원하는 사진과 함께 명령어를 사용하면 얼굴을 분석한 후 닮은 유명인을 알려줍니다.';
export const type = ['기타'];
export async function messageExecute(message) {
    const imageURL = await getMessageImage(message);
    if (!imageURL) {
        await message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
    } else {
        await message.channel.send(await clova_celebrity(imageURL));
    }
}
