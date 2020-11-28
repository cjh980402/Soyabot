const { clientId, clientSecret } = require('../soyabot_config.json');
const fetch = require('node-fetch');
const FormData = require('form-data');

async function requestCFR(type, url) {
    try {
        const params = new FormData();
        const buffer = await (await fetch(url)).buffer();
        params.append("image", buffer);
        const response = await fetch(`https://openapi.naver.com/v1/vision/${type}`, {
            method: 'POST',
            headers: {
                "X-Naver-Client-Id": clientId,
                "X-Naver-Client-Secret": clientSecret
            },
            body: params
        });
        return (await response.json());
    }
    catch (e) {
        return e;
    }
}

async function clova_face(url) {
    const data = await requestCFR("face", url);
    if (!data.info) {
        console.log(data);
        return `사진 분석에 실패하였습니다.\n${/\((.+)\)/.exec(data.errorMessage)[1]}`;
    }

    let rslt = "";
    rslt = `감지된 얼굴 수: ${data.info.faceCount}\n`;
    data.faces.forEach((person, i) => {
        rslt += `${i + 1}번째 얼굴 분석  (X = ${person.roi.x}, Y = ${person.roi.y})\n`;
        rslt += `성별: ${person.gender.value} (신뢰도: ${(person.gender.confidence * 100).toFixed(2)}%)\n`;
        rslt += `나이: ${person.age.value} (신뢰도: ${(person.age.confidence * 100).toFixed(2)}%)\n`;
        rslt += `감정: ${person.emotion.value} (신뢰도: ${(person.emotion.confidence * 100).toFixed(2)}%)\n`;
        rslt += `포즈: ${person.pose.value} (신뢰도: ${(person.pose.confidence * 100).toFixed(2)}%)\n\n`;
    });
    if (data.faces.length > 0) {
        rslt += "위치 기준점(X = 0, Y = 0): 좌측상단";
    }
    return rslt.trimEnd();
}

module.exports = {
    usage: `${client.prefix}얼굴인식`,
    command: ["얼굴인식", "ㅇㄱㅇㅅ"],
    description: "- 원하는 사진과 함께 명령어를 사용하면 얼굴을 분석한 후 성별, 나이 등을 알려줍니다.",
    type: ["기타"],
    async execute(message) {
        if (message.attachments.array().length == 0 || !message.attachments.array()[0].height) {
            return message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
        }
        else {
            return message.channel.send(await clova_face(message.attachments.array()[0].url));
        }
    }
};  