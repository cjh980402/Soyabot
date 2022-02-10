import { fetch } from 'undici';
import { KAKAO_API_KEY } from '../soyabot_config.js';
const langList = {
    한: ['한국어', 'kr'],
    영: ['영어', 'en'],
    일: ['일본어', 'jp'],
    중: ['중국어', 'cn'],
    베: ['베트남어', 'vi'],
    인: ['인도네시아어', 'id'],
    아: ['아랍어', 'ar'],
    뱅: ['뱅갈어', 'bn'],
    독: ['독일어', 'de'],
    스: ['스페인어', 'es'],
    프: ['프랑스어', 'fr'],
    힌: ['힌디어', 'hi'],
    이: ['이탈리아어', 'it'],
    말: ['말레이시아어', 'ms'],
    네: ['네덜란드어', 'nl'],
    포: ['포르투갈어', 'pt'],
    러: ['러시아어', 'ru'],
    태: ['태국어', 'th'],
    터: ['터키어', 'tr']
};

async function tran(source, target, text) {
    const params = new URLSearchParams();
    params.set('src_lang', source);
    params.set('target_lang', target);
    params.set('query', text);
    const data = await (
        await fetch('https://dapi.kakao.com/v2/translation/translate', {
            method: 'POST',
            headers: {
                Authorization: `KakaoAK ${KAKAO_API_KEY}`
            },
            body: params
        })
    ).json(); // 번역 성공 시 translated_text에 문단(문장의 배열)의 배열이 들어옴
    return data.translated_text?.map((v) => v.join(' ')).join('\n') || '번역에 실패하였습니다.'; // 빈 문자열 대응
}

function findLangCode(src, tar) {
    if (langList[src] && langList[tar]) {
        return [langList[src][1], langList[tar][1]];
    } else {
        return null;
    }
}

export const usage = `${client.prefix}번역 (대상 언어 첫글자 + 결과 언어 첫글자) (내용)`;
export const command = ['번역', 'ㅂㅇ'];
export const description = `- 카카오 i를 이용한 언어 번역을 수행합니다. 한국어 → 영어의 경우 두번째 매개변수는 한영으로 입력하면 됩니다.
- 참고. ${client.prefix}번역 목록`;
export const type = ['기타'];
export async function messageExecute(message, args) {
    if (args[0] === '목록' || args[0] === 'ㅁㄹ') {
        return message.channel.send(
            `<지원하는 언어 종류>\n${Object.values(langList)
                .map((v) => v[0])
                .join(', ')}`
        );
    }
    if (args.length < 2) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }
    const langCode = findLangCode(args[0][0], args[0][1]);
    if (!langCode) {
        return message.channel.send(
            `형식에 맞지 않거나 지원하지 않는 번역입니다.\n입력형식은 '${usage}'입니다.\n언어의 목록은 ${client.prefix}번역 목록을 확인해주세요.`
        );
    }

    const text = message.content.replace(/\s*.+?\s+.+?\s+/, '').trim();
    if (text.length > 5000) {
        return message.channel.send('5000자를 초과하는 내용은 번역하지 않습니다.');
    } else {
        return message.channel.send(await tran(langCode[0], langCode[1], text));
    }
}
export const commandData = {
    name: '번역',
    description: '카카오 i를 이용한 언어 번역을 수행합니다.',
    options: [
        {
            name: '언어목록',
            type: 'SUB_COMMAND',
            description: '번역 가능한 언어 목록을 보여줍니다.'
        },
        {
            name: '언어번역',
            type: 'SUB_COMMAND',
            description: '언어 번역을 수행합니다.',
            options: [
                {
                    name: '대상언어_결과언어',
                    type: 'STRING',
                    description: '대상 언어 첫글자 + 결과 언어 첫글자 입력',
                    required: true
                },
                {
                    name: '내용',
                    type: 'STRING',
                    description: '번역할 문장',
                    required: true
                }
            ]
        }
    ]
};
export async function commandExecute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === '언어목록') {
        return interaction.followUp(
            `<지원하는 언어 종류>\n${Object.values(langList)
                .map((v) => v[0])
                .join(', ')}`
        );
    } else if (subcommand === '언어번역') {
        const translang = interaction.options.getString('대상언어_결과언어');
        const langCode = findLangCode(translang[0], translang[1]);
        if (!langCode) {
            return interaction.followUp('지원하지 않는 번역입니다.');
        }

        const text = interaction.options.getString('내용');
        if (text.length > 5000) {
            return interaction.followUp('5000자를 초과하는 내용은 번역하지 않습니다.');
        } else {
            return interaction.followUp(await tran(langCode[0], langCode[1], text));
        }
    }
}
