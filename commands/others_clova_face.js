import { FormData, request } from 'undici';
import { safelyExtractBody } from 'undici/lib/fetch/body.js';
import { getMessageImage } from '../util/soyabot_util.js';
import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET } from '../soyabot_config.js';

async function requestCFR(url) {
    const form = new FormData();
    const { body: imageBody } = await request(url);
    form.set('image', await imageBody.blob());

    const [formBody, contentType] = safelyExtractBody(form);
    const { body } = await request('https://openapi.naver.com/v1/vision/face', {
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

async function clova_face(url) {
    const data = await requestCFR(url);
    if (!data.info) {
        return `사진 분석에 실패하였습니다.\n${data.errorMessage}`;
    }

    let rslt = `감지된 얼굴 수: ${data.info.faceCount}`;
    if (data.faces.length) {
        rslt += `\n\n${data.faces
            .map(
                (person, i) => `${i + 1}번째 얼굴 분석  (X = ${person.roi.x}, Y = ${person.roi.y})
성별: ${person.gender.value} (신뢰도: ${(person.gender.confidence * 100).toFixed(2)}%)
나이: ${person.age.value} (신뢰도: ${(person.age.confidence * 100).toFixed(2)}%)
감정: ${person.emotion.value} (신뢰도: ${(person.emotion.confidence * 100).toFixed(2)}%)
포즈 : ${person.pose.value} (신뢰도: ${(person.pose.confidence * 100).toFixed(2)}%)`
            )
            .join('\n\n')}\n\n위치 기준점(X = 0, Y = 0): 좌측상단`;
    }
    return rslt;
}

export const usage = `${client.prefix}얼굴인식`;
export const command = ['얼굴인식', 'ㅇㄱㅇㅅ'];
export const description = '- 원하는 사진과 함께 명령어를 사용하면 얼굴을 분석한 후 성별, 나이 등을 알려줍니다.';
export const type = ['기타'];
export async function messageExecute(message) {
    const imageURL = await getMessageImage(message);
    if (!imageURL) {
        return message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
    } else {
        return message.channel.sendSplitCode(await clova_face(imageURL), { split: { char: '\n' } });
    }
}
