import { ApplicationCommandOptionType } from 'discord.js';
import { request } from 'undici';
import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET } from '../soyabot_config.js';

async function tran(source, target, text) {
    const params = new URLSearchParams();
    params.set('source', source);
    params.set('target', target);
    params.set('text', text);
    const { body } = await request('https://openapi.naver.com/v1/papago/n2mt', {
        method: 'POST',
        headers: {
            'X-Naver-Client-Id': NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: params.toString()
    });
    const data = await body.json();
    return data.message?.result.translatedText ?? '번역에 실패했습니다.';
}

function checkLan(src, tar) {
    return (
        (src === 'ko' && tar === 'en') ||
        (src === 'ko' && tar === 'ja') ||
        (src === 'ko' && tar === 'zh-CN') ||
        (src === 'ko' && tar === 'zh-TW') ||
        (src === 'ko' && tar === 'es') ||
        (src === 'ko' && tar === 'fr') ||
        (src === 'ko' && tar === 'ru') ||
        (src === 'ko' && tar === 'vi') ||
        (src === 'ko' && tar === 'th') ||
        (src === 'ko' && tar === 'id') ||
        (src === 'ko' && tar === 'de') ||
        (src === 'ko' && tar === 'it') ||
        (src === 'zh-CN' && tar === 'zh-TW') ||
        (src === 'zh-CN' && tar === 'ja') ||
        (src === 'zh-TW' && tar === 'ja') ||
        (src === 'en' && tar === 'ja') ||
        (src === 'en' && tar === 'zh-CN') ||
        (src === 'en' && tar === 'zh-TW') ||
        (src === 'en' && tar === 'fr')
    );
}

export const type = '기타';
export const commandData = {
    name: '파파고',
    description: '파파고를 이용한 언어 번역을 수행합니다.',
    options: [
        {
            name: '언어목록',
            type: ApplicationCommandOptionType.Subcommand,
            description: '번역 가능한 언어 목록을 보여줍니다.'
        },
        {
            name: '언어번역',
            type: ApplicationCommandOptionType.Subcommand,
            description: '언어 번역을 수행합니다.',
            options: [
                {
                    name: '대상언어',
                    type: ApplicationCommandOptionType.String,
                    description: '대상 언어의 영어 코드',
                    choices: ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'ru', 'vi', 'th', 'id', 'de', 'it'].map(
                        (v) => ({ name: v, value: v })
                    ),
                    required: true
                },
                {
                    name: '결과언어',
                    type: ApplicationCommandOptionType.String,
                    description: '결과 언어의 영어 코드',
                    choices: ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'ru', 'vi', 'th', 'id', 'de', 'it'].map(
                        (v) => ({ name: v, value: v })
                    ),
                    required: true
                },
                {
                    name: '내용',
                    type: ApplicationCommandOptionType.String,
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
        const list =
            '한국어(ko)-영어(en), 한국어(ko)-일본어(ja), 한국어(ko)-중국어 간체(zh-CN), 한국어(ko)-중국어 번체(zh-TW), 한국어(ko)-스페인어(es), 한국어(ko)-프랑스어(fr), 한국어(ko)-러시아어(ru), 한국어(ko)-베트남어(vi), 한국어(ko)-태국어(th), 한국어(ko)-인도네시아어(id), 한국어(ko)-독일어(de), 한국어(ko)-이탈리아어(it), 중국어 간체(zh-CN) - 중국어 번체(zh-TW), 중국어 간체(zh-CN) - 일본어(ja), 중국어 번체(zh-TW) - 일본어(ja), 영어(en)-일본어(ja), 영어(en)-중국어 간체(zh-CN), 영어(en)-중국어 번체(zh-TW), 영어(en)-프랑스어(fr)';
        await interaction.followUp(`<지원하는 번역 종류>\n\n${list.replace(/, /g, '\n')}\n\n순서는 바뀌어도 됩니다.`);
    } else if (subcommand === '언어번역') {
        const source = interaction.options.getString('대상언어');
        const target = interaction.options.getString('결과언어');
        if (!checkLan(source, target) && !checkLan(target, source)) {
            return interaction.followUp('지원하지 않는 번역입니다.');
        }

        const text = interaction.options.getString('내용');
        if (text.length > 1000) {
            await interaction.followUp('1000자를 초과하는 내용은 번역하지 않습니다.');
        } else {
            await interaction.followUp(await tran(source, target, text));
        }
    }
}
