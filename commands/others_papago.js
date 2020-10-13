const fetch = require('node-fetch');
const { clientId, clientSecret } = require("../config.json");

async function tran(source, target, text) {
    try {
        const params = new URLSearchParams();
        params.append("source", source);
        params.append("target", target);
        params.append("text", text);
        const response = await fetch("https://openapi.naver.com/v1/papago/n2mt", {
            method: 'POST',
            headers: {
                "X-Naver-Client-Id": clientId,
                "X-Naver-Client-Secret": clientSecret
            },
            body: params
        });
        return (await response.json()).message.result.translatedText;
    }
    catch (e) {
        return e; //오류 반환
    }
}

function checklan(src, tar) {
    if ((src == 'ko' && tar == 'en') || (src == 'ko' && tar == 'ja') || (src == 'ko' && tar == 'zh-CN') ||
        (src == 'ko' && tar == 'zh-TW') || (src == 'ko' && tar == 'es') || (src == 'ko' && tar == 'fr') ||
        (src == 'ko' && tar == 'ru') || (src == 'ko' && tar == 'vi') || (src == 'ko' && tar == 'th') ||
        (src == 'ko' && tar == 'id') || (src == 'ko' && tar == 'de') || (src == 'ko' && tar == 'it') ||
        (src == 'zh-CN' && tar == 'zh-TW') || (src == 'zh-CN' && tar == 'ja') ||
        (src == 'zh-TW' && tar == 'ja') || (src == 'en' && tar == 'ja') || (src == 'en' && tar == 'zh-CN') ||
        (src == 'en' && tar == 'zh-TW') || (src == 'en' && tar == 'fr'))
        return true;
    else
        return false;
}

module.exports = {
    usage: `${client.prefix}번역 (번역 대상 언어) (번역 결과 언어) (내용)`,
    command: ["번역", "ㅂㅇ"],
    description: "- 입력한 언어 설정에 따른 번역결과 출력",
    type: ["기타"],
    async execute(message, args) {
        if (args.length < 3)
            return message.channel.send(`**${this.usage}**\n- 대체 명령어 : ${this.command}\n${this.description}`);
        if (args[0] == '목록' || args[0] == 'ㅁㄹ') {
            const allsee = "\u200b".repeat(500); //강제 장문 전환 목적의 투명문자
            const list = '한국어(ko)-영어(en), 한국어(ko)-일본어(ja), 한국어(ko)-중국어 간체(zh-CN), 한국어(ko)-중국어 번체(zh-TW), 한국어(ko)-스페인어(es), 한국어(ko)-프랑스어(fr), 한국어(ko)-러시아어(ru), 한국어(ko)-베트남어(vi), 한국어(ko)-태국어(th), 한국어(ko)-인도네시아어(id), 한국어(ko)-독일어(de), 한국어(ko)-이탈리아어(it), 중국어 간체(zh-CN) - 중국어 번체(zh-TW), 중국어 간체(zh-CN) - 일본어(ja), 중국어 번체(zh-TW) - 일본어(ja), 영어(en)-일본어(ja), 영어(en)-중국어 간체(zh-CN), 영어(en)-중국어 번체(zh-TW), 영어(en)-프랑스어(fr)';
            return message.channel.send(`<지원하는 번역 종류>${allsee}\n\n${list.replace(/, /g, '\n')}\n\n순서는 바뀌어도 됩니다.`);
        }

        if ((!checklan(args[0], args[1]) && !checklan(args[1], args[0])) || args[2] == undefined) {
            return message.channel.send('형식에 맞지 않거나 지원하지 않는 번역입니다.\n입력형식은 "!번역 (대상언어) (결과언어) (번역할 내용)"입니다.');
        }

        const msg = args.slice(2).join(' ');
        if (msg.length > 500)
            message.channel.send('500자를 초과하는 내용은 번역하지 않습니다.');
        else
            message.channel.send(await tran(args[0], args[1], msg));
    }
};
