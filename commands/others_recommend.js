import { PREFIX } from '../soyabot_config.js';

function recommendWork(name) {
    const worklist = [
        '메이플스토리',
        '제로 육성',
        '현금술',
        '본캐 275 달성',
        '유니온 8천 달성',
        '보스 먹자',
        '보스 솔플',
        '여로 일퀘',
        '츄츄 일퀘',
        '드림브레이커',
        '스피릿 세이비어',
        '모라스 일퀘',
        '에스페라 일퀘',
        '스타포스',
        '템펙업',
        '코펙업',
        '젬펙업',
        '마을에서 점프하기',
        `${name}과 놀기`,
        '시험 공부',
        '코딩',
        '과제',
        '간식 먹기',
        '전공 공부',
        '게으름 피우기',
        '허리 펴기',
        '손가락 운동',
        '잠 자기',
        '밥 먹기',
        '퇴근',
        '운동',
        '출근',
        '야근',
        '다형성을 이용한 객체지향 프로그래밍의 장점 공부하기',
        '팀플',
        '유급휴가',
        '무급노동',
        '여행',
        '대학원 가기',
        '매운 음식 먹기',
        '취업 준비',
        '멍 때리기',
        '기지개 켜기',
        '끝내주게 누워있기'
    ];
    return `할 일은 [${worklist[Math.floor(Math.random() * worklist.length)]}]입니다.`;
}

function recommendFood() {
    const badgelist = [
        '뱃지 오브 준나',
        '뱃지 오브 마노',
        '뱃지 오브 치우',
        '뱃지 오브 보탄',
        '뱃지 오브 도나르',
        '뱃지 오브 프루바',
        '뱃지 오브 사투르누스'
    ]; // 일, 월, 화, 수, 목, 금, 토
    const foodlist = [
        badgelist[new Date().getDay()], // 오늘에 해당하는 뱃지
        '코어 젬스톤',
        '재물 획득의 비약',
        '경험 축적의 비약',
        '몽환의 벨트',
        '거대한 공포',
        '루즈 컨트롤 머신 마크',
        '마력이 깃든 안대',
        '골드애플',
        '메소',
        '익스트림 성장의 비약',
        '손상된 블랙 하트',
        '고통의 근원',
        '창세의 뱃지',
        '커맨더 포스 이어링',
        '저주받은 마도서',
        '경험치 2배 쿠폰',
        '레드 큐브',
        '블랙 큐브',
        '에디셔널 큐브',
        '가츠동',
        '삼겹살',
        '치킨',
        '짜장면',
        '짬뽕',
        '탕수육',
        '부대찌개',
        '순대국밥',
        '돼지국밥',
        '부침개',
        '파전',
        '보쌈',
        '족발',
        '냉면',
        '크림 파스타',
        '라면(진순 X)',
        '민트초코',
        '아이스크림',
        '따뜻한 아이스 아메리카노',
        '곱창 덮밥',
        '제육 덮밥',
        '돈까스',
        '참치 김밥',
        '막창',
        '마라탕',
        '뼈해장국',
        '참치마요',
        '싸이버거',
        '감자탕',
        '참치김밥',
        '우거지 해장국',
        '청국장 찌개',
        '초밥',
        '스팸',
        '스파게티',
        '토마 호크',
        '티본 스테이크',
        '대창',
        '파인애플 피자',
        '순두부 찌개',
        '차돌 된장찌개',
        '육회',
        '곰젤리',
        '햄버거',
        '간장비빔국수',
        '굶기'
    ];
    return `추천 메뉴는 [${foodlist[Math.floor(Math.random() * foodlist.length)]}]입니다.`;
}

export const usage = `${PREFIX}추천 (카테고리)`;
export const command = ['추천', 'ㅊㅊ'];
export const description = '- 봇이 카테고리(할일, 메뉴)에 따른 추천을 해줍니다.';
export const type = ['기타'];
export async function messageExecute(message, args) {
    if (args[0] === '할일' || args[0] === 'ㅎㅇ') {
        await message.channel.send(recommendWork(message.client.user.username));
    } else if (args[0] === '메뉴' || args[0] === 'ㅁㄴ') {
        await message.channel.send(recommendFood());
    } else {
        await message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }
}
export const commandData = {
    name: '추천',
    description: '봇이 할 일이나 메뉴를 추천해줍니다.',
    options: [
        {
            name: '할_일',
            type: 'SUB_COMMAND',
            description: '할 일을 추천해줍니다.'
        },
        {
            name: '메뉴',
            type: 'SUB_COMMAND',
            description: '메뉴를 추천해줍니다.'
        }
    ]
};
export async function commandExecute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === '할_일') {
        await interaction.followUp(recommendWork(interaction.client.user.username));
    } else if (subcommand === '메뉴') {
        await interaction.followUp(recommendFood());
    }
}
