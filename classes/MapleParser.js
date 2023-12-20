import { request } from 'undici';
import { load } from 'cheerio';
import { setTimeout } from 'node:timers/promises';

const serverData = [
    [
        0,
        {
            id: 0,
            key: 'scania',
            name: '스카니아',
            iconUrl: 'https://cdn.maple.gg/images/maplestory/world/ico_world_scania.gif'
        }
    ],
    [
        1,
        { id: 1, key: 'bera', name: '베라', iconUrl: 'https://cdn.maple.gg/images/maplestory/world/ico_world_bera.gif' }
    ],
    [
        3,
        { id: 3, key: 'luna', name: '루나', iconUrl: 'https://cdn.maple.gg/images/maplestory/world/ico_world_luna.gif' }
    ],
    [
        4,
        {
            id: 4,
            key: 'zenith',
            name: '제니스',
            iconUrl: 'https://cdn.maple.gg/images/maplestory/world/ico_world_zenith.gif'
        }
    ],
    [
        5,
        {
            id: 5,
            key: 'croa',
            name: '크로아',
            iconUrl: 'https://cdn.maple.gg/images/maplestory/world/ico_world_croa.gif'
        }
    ],
    [
        16,
        {
            id: 16,
            key: 'elysium',
            name: '엘리시움',
            iconUrl: 'https://cdn.maple.gg/images/maplestory/world/ico_world_elysium.gif'
        }
    ],
    [
        10,
        {
            id: 10,
            key: 'union',
            name: '유니온',
            iconUrl: 'https://cdn.maple.gg/images/maplestory/world/ico_world_union.gif'
        }
    ],
    [
        29,
        {
            id: 29,
            key: 'enosis',
            name: '이노시스',
            iconUrl: 'https://cdn.maple.gg/images/maplestory/world/ico_world_enosis.gif'
        }
    ],
    [
        43,
        { id: 43, key: 'red', name: '레드', iconUrl: 'https://cdn.maple.gg/images/maplestory/world/ico_world_red.gif' }
    ],
    [
        44,
        {
            id: 44,
            key: 'aurora',
            name: '오로라',
            iconUrl: 'https://cdn.maple.gg/images/maplestory/world/ico_world_aurora.gif'
        }
    ],
    [
        45,
        {
            id: 45,
            key: 'reboot',
            name: '리부트',
            iconUrl: 'https://cdn.maple.gg/images/maplestory/world/ico_world_reboot.gif',
            isReboot: true
        }
    ],
    [
        46,
        {
            id: 46,
            key: 'reboot2',
            name: '리부트2',
            iconUrl: 'https://cdn.maple.gg/images/maplestory/world/ico_world_reboot2.gif',
            isReboot: true
        }
    ],
    [
        48,
        {
            id: 48,
            key: 'burning2',
            name: '버닝2',
            iconUrl: 'https://cdn.maple.gg/images/maplestory/world/ico_world_burning.gif',
            isBurning: true
        }
    ],
    [
        49,
        {
            id: 49,
            key: 'burning',
            name: '버닝',
            iconUrl: 'https://cdn.maple.gg/images/maplestory/world/ico_world_burning.gif',
            isBurning: true
        }
    ],
    [
        50,
        {
            id: 50,
            key: 'arcane',
            name: '아케인',
            iconUrl: 'https://cdn.maple.gg/images/maplestory/world/ico_world_arcane.gif'
        }
    ],
    [
        51,
        {
            id: 51,
            key: 'nova',
            name: '노바',
            iconUrl: 'https://cdn.maple.gg/images/maplestory/world/ico_world_nova.gif'
        }
    ],
    [
        -1,
        {
            id: -1,
            key: 'all',
            name: '전체',
            iconUrl: 'https://cdn.dak.gg/maple/images/page/rank/icon/ico-world-all.png'
        }
    ]
];

const jobData = [
    [
        1,
        { id: 1, name: '기사단', key: null, shortName: '$undefined', classStart: '$undefined', classEnd: '$undefined' }
    ],
    [2, { id: 2, name: '소울마스터', key: 'soulmaster', shortName: '소마', classStart: 1, classEnd: 5 }],
    [3, { id: 3, name: '도적', key: null, shortName: '$undefined', classStart: '$undefined', classEnd: '$undefined' }],
    [4, { id: 4, name: '듀얼블레이더', key: 'dualblader', shortName: '듀블', classStart: 4, classEnd: 5 }],
    [
        5,
        { id: 5, name: '마법사', key: null, shortName: '$undefined', classStart: '$undefined', classEnd: '$undefined' }
    ],
    [6, { id: 6, name: '비숍', key: 'bishop', shortName: '$undefined', classStart: 4, classEnd: 5 }],
    [7, { id: 7, name: '나이트로드', key: 'nightlord', shortName: '나로', classStart: 4, classEnd: 5 }],
    [8, { id: 8, name: '제로', key: 'zero', shortName: '$undefined', classStart: 1, classEnd: 5 }],
    [9, { id: 9, name: '해적', key: 'pirate', shortName: '$undefined', classStart: 1, classEnd: 1 }],
    [10, { id: 10, name: '바이퍼', key: 'viper', shortName: '$undefined', classStart: 4, classEnd: 5 }],
    [
        11,
        {
            id: 11,
            name: '레지스탕스',
            key: null,
            shortName: '$undefined',
            classStart: '$undefined',
            classEnd: '$undefined'
        }
    ],
    [12, { id: 12, name: '아크메이지(썬,콜)', key: 'arkmagetc', shortName: '썬콜', classStart: 4, classEnd: 5 }],
    [13, { id: 13, name: '아란', key: 'aran', shortName: '$undefined', classStart: 1, classEnd: 5 }],
    [14, { id: 14, name: '데몬 슬레이어', key: 'demonslayer', shortName: '데슬', classStart: 1, classEnd: 5 }],
    [15, { id: 15, name: '와일드헌터', key: 'wildhunter', shortName: '와헌', classStart: 1, classEnd: 5 }],
    [16, { id: 16, name: '메르세데스', key: 'mercedes', shortName: '메르', classStart: 1, classEnd: 5 }],
    [17, { id: 17, name: '팬텀', key: 'phantom', shortName: '$undefined', classStart: 1, classEnd: 5 }],
    [
        18,
        { id: 18, name: '궁수', key: null, shortName: '$undefined', classStart: '$undefined', classEnd: '$undefined' }
    ],
    [19, { id: 19, name: '보우마스터', key: 'bowmaster', shortName: '보마', classStart: 4, classEnd: 5 }],
    [20, { id: 20, name: '카이저', key: 'kaiser', shortName: '$undefined', classStart: 1, classEnd: 5 }],
    [21, { id: 21, name: '배틀메이지', key: 'battlemage', shortName: '배메', classStart: 1, classEnd: 5 }],
    [
        22,
        { id: 22, name: '전사', key: null, shortName: '$undefined', classStart: '$undefined', classEnd: '$undefined' }
    ],
    [23, { id: 23, name: '다크나이트', key: 'darkknight', shortName: '닼나', classStart: 4, classEnd: 5 }],
    [24, { id: 24, name: '아크', key: 'ark', shortName: '$undefined', classStart: 1, classEnd: 5 }],
    [25, { id: 25, name: '스트라이커', key: 'striker', shortName: '스커', classStart: 1, classEnd: 5 }],
    [26, { id: 26, name: '아크메이지(불,독)', key: 'arkmagefp', shortName: '불독', classStart: 4, classEnd: 5 }],
    [27, { id: 27, name: '윈드브레이커', key: 'windbreaker', shortName: '윈브', classStart: 1, classEnd: 5 }],
    [28, { id: 28, name: '플레임위자드', key: 'flamewizard', shortName: '플위', classStart: 1, classEnd: 5 }],
    [29, { id: 29, name: '캐논마스터', key: 'cannonmaster', shortName: '캐논', classStart: 4, classEnd: 5 }],
    [30, { id: 30, name: '히어로', key: 'hero', shortName: '$undefined', classStart: 4, classEnd: 5 }],
    [31, { id: 31, name: '은월', key: 'shade', shortName: '$undefined', classStart: 1, classEnd: 5 }],
    [32, { id: 32, name: '팔라딘', key: 'paladin', shortName: '$undefined', classStart: 4, classEnd: 5 }],
    [33, { id: 33, name: '메카닉', key: 'mechanic', shortName: '$undefined', classStart: 1, classEnd: 5 }],
    [34, { id: 34, name: '루미너스', key: 'luminous', shortName: '루미', classStart: 1, classEnd: 5 }],
    [35, { id: 35, name: '키네시스', key: 'kinesis', shortName: '키네', classStart: 1, classEnd: 5 }],
    [36, { id: 36, name: '섀도어', key: 'shadower', shortName: '$undefined', classStart: 4, classEnd: 5 }],
    [37, { id: 37, name: '나이트워커', key: 'nightwalker', shortName: '나워', classStart: 1, classEnd: 5 }],
    [38, { id: 38, name: '엔젤릭버스터', key: 'angelicbuster', shortName: '엔버', classStart: 1, classEnd: 5 }],
    [39, { id: 39, name: '신궁', key: 'marks', shortName: '$undefined', classStart: 4, classEnd: 5 }],
    [40, { id: 40, name: '에반', key: 'evan', shortName: '$undefined', classStart: 1, classEnd: 5 }],
    [41, { id: 41, name: '캡틴', key: 'captain', shortName: '$undefined', classStart: 4, classEnd: 5 }],
    [42, { id: 42, name: '카데나', key: 'cadena', shortName: '$undefined', classStart: 1, classEnd: 5 }],
    [43, { id: 43, name: '블래스터', key: 'blaster', shortName: '$undefined', classStart: 1, classEnd: 5 }],
    [44, { id: 44, name: '일리움', key: 'illium', shortName: '$undefined', classStart: 1, classEnd: 5 }],
    [45, { id: 45, name: '시티즌(초보자)', key: null, shortName: '$undefined', classStart: 0, classEnd: 0 }],
    [46, { id: 46, name: '노블레스', key: null, shortName: '$undefined', classStart: 0, classEnd: 0 }],
    [47, { id: 47, name: '초보자', key: null, shortName: '$undefined', classStart: 0, classEnd: 0 }],
    [48, { id: 48, name: '핑크빈', key: 'pinkbeen', shortName: '$undefined', classStart: 1, classEnd: 4 }],
    [49, { id: 49, name: '클레릭', key: 'cleric', shortName: '$undefined', classStart: 3, classEnd: 3 }],
    [50, { id: 50, name: '프리스트', key: 'priest', shortName: '$undefined', classStart: 3, classEnd: 3 }],
    [51, { id: 51, name: '헌터', key: 'hunter', shortName: '$undefined', classStart: 2, classEnd: 2 }],
    [52, { id: 52, name: '어쌔신', key: 'assassin', shortName: '$undefined', classStart: 2, classEnd: 2 }],
    [53, { id: 53, name: '레인저', key: 'ranger', shortName: '$undefined', classStart: 3, classEnd: 3 }],
    [54, { id: 54, name: '파이터', key: 'fighter', shortName: '$undefined', classStart: 2, classEnd: 2 }],
    [55, { id: 55, name: '나이트', key: 'knight', shortName: '$undefined', classStart: 3, classEnd: 3 }],
    [56, { id: 56, name: '메이지(썬,콜)', key: 'magetc', shortName: '썬콜', classStart: 3, classEnd: 3 }],
    [57, { id: 57, name: '페이지', key: 'page', shortName: '$undefined', classStart: 2, classEnd: 2 }],
    [58, { id: 58, name: '위자드(썬,콜)', key: 'wizardtc', shortName: '썬콜', classStart: 2, classEnd: 2 }],
    [59, { id: 59, name: '허밋', key: 'hermit', shortName: '$undefined', classStart: 3, classEnd: 3 }],
    [60, { id: 60, name: '검사', key: 'swordman', shortName: '$undefined', classStart: 1, classEnd: 1 }],
    [61, { id: 61, name: '매지션', key: 'magician', shortName: '$undefined', classStart: 1, classEnd: 1 }],
    [62, { id: 62, name: '메이지(불,독)', key: 'magefp', shortName: '불독', classStart: 3, classEnd: 3 }],
    [63, { id: 63, name: '인파이터', key: 'infighter', shortName: '인파', classStart: 2, classEnd: 2 }],
    [64, { id: 64, name: '아처', key: 'archer', shortName: '$undefined', classStart: 1, classEnd: 1 }],
    [65, { id: 65, name: '캐논슈터', key: 'cannonshooter', shortName: '캐슈', classStart: 1, classEnd: 2 }],
    [66, { id: 66, name: '시프', key: 'thief', shortName: '$undefined', classStart: 2, classEnd: 2 }],
    [67, { id: 67, name: '위자드(불,독)', key: 'wizardfp', shortName: '불독', classStart: 2, classEnd: 2 }],
    [68, { id: 68, name: '로그', key: 'rogue', shortName: '$undefined', classStart: 1, classEnd: 1 }],
    [69, { id: 69, name: '듀어러', key: 'dualer', shortName: '$undefined', classStart: 2, classEnd: 2 }],
    [70, { id: 70, name: '버서커', key: 'berserker', shortName: '$undefined', classStart: 3, classEnd: 3 }],
    [71, { id: 71, name: '시프마스터', key: 'thiefmaster', shortName: '$undefined', classStart: 3, classEnd: 3 }],
    [72, { id: 72, name: '크루세이더', key: 'crusader', shortName: '$undefined', classStart: 3, classEnd: 3 }],
    [73, { id: 73, name: '건슬링거', key: 'gunslinger', shortName: '건슬', classStart: 2, classEnd: 2 }],
    [74, { id: 74, name: '슬래셔', key: 'slasher', shortName: '$undefined', classStart: 3, classEnd: 3 }],
    [75, { id: 75, name: '캐논블래스터', key: 'cannonblaster', shortName: '$undefined', classStart: 3, classEnd: 3 }],
    [76, { id: 76, name: '버커니어', key: 'buccaneer', shortName: '$undefined', classStart: 3, classEnd: 3 }],
    [77, { id: 77, name: '발키리', key: 'valkyrie', shortName: '$undefined', classStart: 3, classEnd: 3 }],
    [78, { id: 78, name: '스피어맨', key: 'spearman', shortName: '$undefined', classStart: 2, classEnd: 2 }],
    [79, { id: 79, name: '세미듀어러', key: 'semidualer', shortName: '$undefined', classStart: 1.5, classEnd: 1.5 }],
    [80, { id: 80, name: '저격수', key: 'sniper', shortName: '$undefined', classStart: 3, classEnd: 3 }],
    [81, { id: 81, name: '사수', key: 'marksman', shortName: '$undefined', classStart: 2, classEnd: 2 }],
    [82, { id: 82, name: '듀얼마스터', key: 'dualmaster', shortName: '$undefined', classStart: 2.5, classEnd: 2.5 }],
    [83, { id: 83, name: '', key: null, shortName: '$undefined', classStart: '$undefined', classEnd: '$undefined' }],
    [84, { id: 84, name: '제논', key: 'xenon', shortName: '$undefined', classStart: 1, classEnd: 5 }],
    [85, { id: 85, name: '데몬 어벤져', key: 'demonavenger', shortName: '데벤져', classStart: 1, classEnd: 5 }],
    [86, { id: 86, name: '미하일', key: 'mihile', shortName: '$undefined', classStart: 1, classEnd: 5 }],
    [87, { id: 87, name: '시티즌', key: null, shortName: '$undefined', classStart: 0, classEnd: 0 }],
    [90, { id: 90, name: '패스파인더', key: 'pathfinder', shortName: '패파', classStart: 4, classEnd: 5 }],
    [91, { id: 91, name: '에인션트아처', key: null, shortName: '$undefined', classStart: 2, classEnd: 2 }],
    [92, { id: 92, name: '체이서', key: null, shortName: '$undefined', classStart: 3, classEnd: 3 }],
    [93, { id: 93, name: '아처(패스파인더)', key: null, shortName: '$undefined', classStart: 1, classEnd: 1 }],
    [94, { id: 94, name: '호영', key: 'hoyoung', shortName: '$undefined', classStart: 0, classEnd: 5 }],
    [95, { id: 95, name: '아델', key: 'adele', shortName: '$undefined', classStart: 0, classEnd: 5 }],
    [96, { id: 96, name: '카인', key: 'kain', shortName: '$undefined', classStart: 0, classEnd: 5 }],
    [97, { id: 97, name: '라라', key: 'lara', shortName: '$undefined', classStart: 0, classEnd: 5 }],
    [98, { id: 98, name: '칼리', key: 'khali', shortName: '$undefined', classStart: 0, classEnd: 5 }],
    [
        99,
        {
            id: 99,
            name: '프렌즈 월드',
            key: null,
            shortName: '$undefined',
            classStart: '$undefined',
            classEnd: '$undefined'
        }
    ],
    [
        100,
        {
            id: 100,
            name: '초월자',
            key: null,
            shortName: '$undefined',
            classStart: '$undefined',
            classEnd: '$undefined'
        }
    ]
];

async function requestCheerio(url, options = {}) {
    const { body } = await request(url, options);
    return load(await body.text());
}

async function requestJSON(url, options = {}) {
    const { body } = await request(url, options);
    return body.json();
}

function isEmpty(obj) {
    if (!obj) {
        return true;
    } else if (Array.isArray(obj)) {
        return obj.length === 0;
    } else if (Object.getOwnPropertyNames(obj).length === 0) {
        return true;
    }
    return false;
}

function getJobName(jobId) {
    return jobData.find((v) => v[0] == jobId)?.[1].name;
}

function getServerName(worldId) {
    return serverData.find((v) => v[0] == worldId)?.[1].name;
}

function getServerImage(worldId) {
    return serverData.find((v) => v[0] == worldId)?.[1].iconUrl;
}

export class MapleError extends Error {
    name = 'MapleError';
    code = 'MAPLE_ERR';
    constructor(message) {
        super(message);
        this.message ||= '메이플스토리 기능에서 에러가 발생했습니다.';
    }
}

export class MapleUser {
    // private property
    #name;
    #ggURL;
    #homeLevelURL;
    #homeUnionURL;
    #ggData = null;
    #homeLevelData = null;
    #homeUnionData = null;
    // 생성자
    constructor(name) {
        this.#name = name;
        this.#ggURL = `https://maple.gg/u/${encodeURIComponent(name)}`; // encodeURIComponent는 한글 주소의 경우 필수
        this.#homeLevelURL = `https://maplestory.nexon.com/N23Ranking/World/Total?c=${encodeURIComponent(name)}`; // 초기값은 일반 서버
        this.#homeUnionURL = `https://maplestory.nexon.com/N23Ranking/World/Union?c=${encodeURIComponent(name)}`;
    }
    // getter
    get Name() {
        return this.#name;
    }

    get GGURL() {
        return this.#ggURL;
    }

    get HomeURL() {
        return this.#homeLevelURL;
    }
    // 메소드
    async homeLevel() {
        const len = this.#name.length + (this.#name.match(/[가-힣]/g)?.length ?? 0);
        this.#homeLevelData = await requestCheerio(this.#homeLevelURL);
        if (this.#homeLevelData('img[alt="메이플스토리 서비스 점검중!"]').length !== 0) {
            throw new MapleError('공식 홈페이지가 서비스 점검 중입니다.');
        }

        if (this.#homeLevelData('.rank_table tbody > tr[class]').length !== 10) {
            this.#homeLevelURL += '&w=254'; // 리부트 서버 목록
            this.#homeLevelData = await requestCheerio(this.#homeLevelURL);
        }
        if (len < 1 || len > 12 || this.#homeLevelData('.rank_table tbody > tr[class]').length !== 10) {
            return null; // 없는 캐릭터
        }

        let data = this.#homeLevelData('.search_com_chk > td');
        if (data.length === 0) {
            const nickList = this.#homeLevelData('.rank_table tbody > tr[class] > td.left > dl > dt > a'); // 순위 리스트의 닉네임
            for (let i = 0; i < 10; i++) {
                if (this.#name.toLowerCase() === nickList.eq(i).text().toLowerCase()) {
                    this.#name = nickList.eq(i).text(); // 대소문자 정확한 이름으로 갱신
                    data = this.#homeLevelData('.rank_table tbody > tr[class]').eq(i).find('td');
                    break;
                }
            }
            if (data.length === 0) {
                return null; // 공홈이 오류나서 순위 리스트가 떠도 해당 캐릭터는 없는 경우
            }
        }

        const job = data.eq(1).find('dl > dd').text().split(' / ')[1]; // 직업
        const lev = +data.eq(2).text().slice(3); // 레벨, 숫자값
        const exper = +data.eq(3).text().replace(/,/g, ''); // 경험치, 숫자값
        const popul = +data.eq(4).text().replace(/,/g, ''); // 인기도, 숫자값
        const guild = data.eq(5).text(); // 길드

        return [lev, exper, popul, guild, job];
    }

    async homeUnion() {
        const len = this.#name.length + (this.#name.match(/[가-힣]/g)?.length ?? 0);
        this.#homeUnionData = await requestCheerio(this.#homeUnionURL);
        if (this.#homeUnionData('img[alt="메이플스토리 서비스 점검중!"]').length !== 0) {
            throw new MapleError('공식 홈페이지가 서비스 점검 중입니다.');
        }

        if (len < 1 || len > 12 || this.#homeUnionData('.rank_table tbody > tr').length !== 10) {
            return null; // 유니온 기록이 없음
        }

        let data = this.#homeUnionData('.search_com_chk > td');
        if (data.length === 0) {
            const nickList = this.#homeUnionData('.rank_table tbody > tr > td.left > dl > dt > a'); // 순위 리스트의 닉네임
            for (let i = 0; i < 10; i++) {
                if (this.#name.toLowerCase() === nickList.eq(i).text().toLowerCase()) {
                    this.#name = nickList.eq(i).text(); // 대소문자 정확한 이름으로 갱신
                    data = this.#homeUnionData('.rank_table tbody >  tr').eq(i).find('td');
                    break;
                }
            }
            if (data.length === 0) {
                return null; // 공홈이 오류나서 순위 리스트가 떠도 해당 캐릭터는 없는 경우
            }
        }

        const job = data.eq(1).find('dl > dd').text().split(' / ')[1]; // 직업
        const lev = +data.eq(2).text().replace(/,/g, ''); // 유니온 레벨, 숫자값
        const stat = +data.eq(3).text().replace(/,/g, ''); // 유니온 전투력, 숫자값
        const coin = Math.floor(stat * 0.000000864); // 일일 코인 수급량, 숫자값

        return [lev, stat, coin, job];
    }

    async isLatest() {
        const updateResult = await this.#updateUser();

        this.#ggData = await requestCheerio(this.#ggURL);
        if (this.#ggData('img[alt="검색결과 없음"]').length !== 0) {
            throw new MapleError('maple.GG에서 캐릭터 정보를 가져올 수 없습니다.');
        } else if (this.#ggData('div.alert.alert-warning.mt-3').length !== 0) {
            throw new MapleError('maple.GG 서버가 점검 중입니다.');
        } else if (
            /Bad Gateway|Error/.test(this.#ggData('title').text()) ||
            this.#ggData('div.flex-center.position-ref.full-height').length !== 0
        ) {
            throw new MapleError('maple.GG 서버에 에러가 발생했습니다.');
        }
        this.#ggData = JSON.parse(/({\\"profile\\":.+?})\]\\n/s.exec(this.#ggData.html())[1].replace(/\\"/g, '"'));

        return updateResult;
    }

    async #updateUser() {
        const start = Date.now();
        while (1) {
            let rslt = null;
            try {
                rslt = await requestJSON(
                    `https://maple.dakgg.io/api/v1/characters/${encodeURIComponent(this.#name)}/sync`,
                    {
                        headers: {
                            referer: this.#ggURL
                        }
                    }
                );
                if (rslt.error) {
                    return false; // 갱신실패
                } else if (rslt.state === 200) {
                    return true; // 갱신성공
                }
            } catch {
                return false; // 갱신실패
            }
            if (Date.now() - start >= 10000) {
                return false; // 10초가 지나도 갱신 못했으면 갱신실패 판정
            }
            await setTimeout(rslt?.retryAfter ?? 1000);
        }
    }

    Murung() {
        const murung = this.#ggData?.profile.dojangRank;
        if (isEmpty(murung)) {
            return null;
        }

        const murungdate = murung.date; // 무릉 최고기록 날짜
        const murungtime = murung.duration; // 무릉 클리어 시간 (초 단위)
        const murungfl = murung.floor; // 무릉 최고 층수
        const murungjob = getJobName(murung.detailJobId); // 유저 직업
        const murunglev = this.Level(); // 유저 레벨

        return [murunglev, murungjob, murungfl, murungtime, murungdate];
    }

    Seed() {
        const seed = this.#ggData?.profile.seedRank;
        if (isEmpty(seed)) {
            return null;
        }

        const seeddate = seed.date; // 시드 최고기록 날짜
        const seedtime = seed.duration; // 시드 클리어 시간 (초 단위)
        const seedfl = seed.floor; // 시드 최고 층수
        const seedjob = getJobName(seed.detailJobId); // 유저 직업
        const seedlev = this.Level(); // 유저 레벨

        return [seedlev, seedjob, seedfl, seedtime, seeddate];
    }

    Union() {
        const union = this.#ggData?.profile.unionRank;
        if (isEmpty(union)) {
            return null;
        }

        const lev = union.n4level; // 유니온 레벨
        const stat = union.dps; // 유니온 전투력
        const coin = Math.floor(stat * 0.000000864); // 일일 코인 수급량
        const grade = ''; // 유니온 등급

        return [lev, stat, coin, grade];
    }

    Achieve() {
        const achieve = this.#ggData?.profile.achievementRank;
        if (isEmpty(achieve)) {
            return null;
        }

        const grade = ''; // 업적 등급
        const score = achieve.score; // 업적 점수
        const worldrank = achieve.worldRank; // 월드랭킹
        const allrank = achieve.rank; // 전체랭킹

        return [grade, score, worldrank, allrank];
    }

    Rank() {
        const totalRank = this.#ggData?.profile.totalRank;
        const jobRank = this.#ggData?.profile.jobRank;
        if (isEmpty(totalRank) || isEmpty(jobRank)) {
            return null;
        }

        return [totalRank.rank, totalRank.worldRank, jobRank.rank, jobRank.worldRank];
    }

    Coordi() {
        const coordi = this.#ggData?.profile.avatarInfo;
        if (isEmpty(coordi)) {
            return null;
        }

        return coordi;
    }

    ExpHistory() {
        const expHistory = this.#ggData?.profile.characterExpLogs;
        if (isEmpty(expHistory)) {
            return null;
        }

        return expHistory; // 배열의 원소 구성: date, level, exp(%), exp
    }

    LevelHistory() {
        const levHistory = this.#ggData?.profile.characterLevelLogs;
        if (isEmpty(levHistory)) {
            return null;
        }

        return levHistory; // 배열의 원소 구성: date, level
    }

    MurungHistory() {
        const murungHistory = this.#ggData?.profile.dojangLogs;
        if (isEmpty(murungHistory)) {
            return null;
        }

        return murungHistory; // 배열의 원소 구성: date, floor
    }

    Collection() {
        const collection = this.#ggData?.profile.avatarLogs;
        if (isEmpty(collection)) {
            return null;
        }

        return collection; // 배열의 원소 구성: date, url, data
    }

    Level() {
        return this.#ggData?.profile.character.level;
    }

    Job() {
        const detailJobId = this.#ggData?.profile.character.detailJobId;
        return jobData.find((v) => v[0] == detailJobId)?.[1].name;
    }

    Popularity() {
        return this.#ggData?.profile.character.popular;
    }

    userImg(full = true) {
        const img = this.#ggData?.profile.character.imageUrl;
        return full ? img?.replace('Character/', 'Character/180/') : img;
    }

    serverImg() {
        return getServerImage(this.#ggData?.profile.character.worldId);
    }

    serverName() {
        return getServerName(this.#ggData?.profile.character.worldId);
    }

    lastActiveDay() {
        return this.#ggData?.profile.character.latestDataChangedAt;
    }
}

export class MapleGuild {
    // private property
    #server;
    #name;
    #ggURL;
    #ggData = null;
    #memberData = null;
    // 생성자
    constructor(server, name) {
        this.#server = server;
        this.#name = name;
        this.#ggURL = `https://maple.gg/guild/${server}/${encodeURIComponent(name)}`; // encodeURIComponent는 한글 주소의 경우 필수
    }
    // getter
    get Server() {
        return this.#server;
    }

    get Name() {
        return this.#name;
    }

    get MemberCount() {
        return this.#memberData?.length ?? 0;
    }
    // 메소드
    async isLatest() {
        const updateResult = await this.#updateGuild();

        this.#ggData = await requestCheerio(`${this.#ggURL}/members?sort=level`); // this.#ggData는 함수
        if (this.#ggData('img[alt="404 ERROR"]').length !== 0) {
            throw new MapleError('maple.GG에서 길드 정보를 가져올 수 없습니다.');
        } else if (this.#ggData('div.alert.alert-warning.mt-3').length !== 0) {
            throw new MapleError('maple.GG 서버가 점검 중입니다.');
        } else if (
            /Bad Gateway|Error/.test(this.#ggData('title').text()) ||
            this.#ggData('div.flex-center.position-ref.full-height').length !== 0
        ) {
            throw new MapleError('maple.GG 서버에 에러가 발생했습니다.');
        }

        this.#memberData = this.#ggData('.pt-2.bg-white.rounded.border.font-size-0.line-height-1');
        return updateResult;
    }

    async memberDataList() {
        const rslt = [];
        const memberList = this.#memberData.map((_, v) => new MapleUser(this.#ggData(v).find('.mb-2 a').eq(1).text()));
        const updateRslt = await Promise.all(memberList.map((_, v) => v.isLatest()));
        for (let i = 0; i < this.MemberCount; i++) {
            rslt.push(
                `[갱신 ${updateRslt[i] ? '성공' : '실패'}] ${
                    this.#memberData.eq(i).find('header > span').text() || '길드원'
                }: ${memberList[i].Name}, ${memberList[i].Job()} / Lv.${memberList[i].Level()}, 유니온: ${
                    memberList[i].Union()?.[0].toLocaleString() ?? '-'
                }, 무릉: ${memberList[i].Murung()?.[1] ?? '-'} (${memberList[i].lastActiveDay()})`
            );
        }

        return rslt;
    }

    async #updateGuild() {
        const start = Date.now();
        while (1) {
            let rslt = null;
            try {
                rslt = await requestJSON(`${this.#ggURL}/sync`, {
                    headers: {
                        referer: this.#ggURL
                    }
                });
                if (rslt.error) {
                    return false; // 갱신실패
                } else if (rslt.state === 200) {
                    return true; // 갱신성공
                }
            } catch {
                return false; // 갱신실패
            }
            if (Date.now() - start >= 10000) {
                return false; // 10초가 지나도 갱신 못했으면 갱신실패 판정
            }
            await setTimeout(rslt?.retryAfter ?? 1000);
        }
    }
}
