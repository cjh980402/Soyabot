const { clientId, clientSecret } = require('../config.json');
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

async function clova_celebrity(url) {
    const data = await requestCFR("celebrity", url);
    if (!data.info) {
        console.log(data);
        return `사진 분석에 실패하였습니다.\n${/\((.+)\)/.exec(data.errorMessage)[1]}`;
    }

    let rslt = "";
    rslt = `닮은 유명인 수 : ${data.info.faceCount}\n`;
    data.faces.forEach((person) => {
        rslt += `이름 : ${person.celebrity.value} (신뢰도 : ${(person.celebrity.confidence * 100).toFixed(2)}%)\n`;
    });
    return rslt.trimEnd();
}

module.exports = {
    usage: `${client.prefix}닮은꼴`,
    command: ["닮은꼴", "ㄷㅇㄲ"],
    description: "- 원하는 사진과 함께 명령어를 사용하면 얼굴을 분석한 후 닮은 유명인을 알려줍니다.",
    type: ["기타"],
    async execute(message) {
        if (message.attachments.array().length == 0 || !message.attachments.array()[0].height) {
            return message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
        }
        else {
            return message.channel.send(await clova_celebrity(message.attachments.array()[0].url));
        }
    }
};