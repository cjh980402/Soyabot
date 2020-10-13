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

async function clova(cmd, url) {
    const type = (cmd < 2) ? "celebrity" : "face";
    const data = await requestCFR(type, url);
    if (!data.info) {
        console.log(data);
        return `사진 분석에 실패하였습니다.\n${/\((.+)\)/.exec(data.errorMessage)[1]}`;
    }
    const cnt = data.info.faceCount;

    let rslt = "";
    if (type == "celebrity") {
        rslt = `닮은 유명인 수 : ${cnt}\n`;
        for (let person of data.faces) {
            rslt += `이름 : ${person.celebrity.value} (신뢰도 : ${(person.celebrity.confidence * 100).toFixed(2)}%)\n`;
        }
        rslt += "\n";
    }
    else {
        let i = 1;
        rslt = `감지된 얼굴 수 : ${cnt}\n`;
        for (let person of data.faces) {
            rslt += `${i}번째 얼굴 분석  (X = ${person.roi.x}, Y = ${person.roi.y})\n`;
            rslt += `성별 : ${person.gender.value} (신뢰도 : ${(person.gender.confidence * 100).toFixed(2)}%)\n`;
            rslt += `나이 : ${person.age.value} (신뢰도 : ${(person.age.confidence * 100).toFixed(2)}%)\n`;
            rslt += `감정 : ${person.emotion.value} (신뢰도 : ${(person.emotion.confidence * 100).toFixed(2)}%)\n`;
            rslt += `포즈 : ${person.pose.value} (신뢰도 : ${(person.pose.confidence * 100).toFixed(2)}%)\n\n`;
            i++;
        }
        rslt += (!cnt ? "\n" : "위치 기준점(X = 0, Y = 0) : 좌측상단\n");
    }
    return rslt.trimEnd();
}


module.exports = {
    usage: `${client.prefix}닮은꼴 또는 얼굴인식`,
    command: ["닮은꼴", "ㄷㅇㄲ", "얼굴인식", "ㅇㄱㅇㅅ"],
    description: `- 원하는 사진과 함께 명령어를 사용하면 얼굴을 분석한 후 닮은 유명인(닮은꼴)이나 성별, 나이 등(얼굴인식)을 알려줍니다.`,
    type: ["기타"],
    async execute(message) {
        if (message.attachments.array().length == 0 || !message.attachments.array()[0].height) {
            message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
        }
        else {
            for (let i in this.command) {
                if (message.content.includes(this.command[i]))
                    return message.channel.send(await clova(i, message.attachments.array()[0].url));
            }
        }
    }
};