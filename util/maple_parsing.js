import fetch from 'node-fetch';
import { load } from 'cheerio';
import { setTimeout } from 'node:timers/promises';

async function linkParse(link) {
    return load(await (await fetch(link)).text());
}

async function linkJSON(link) {
    return (await fetch(link)).json();
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
        this.#homeLevelURL = `https://maplestory.nexon.com/Ranking/World/Total?c=${encodeURIComponent(name)}`; // 초기값은 일반 서버
        this.#homeUnionURL = `https://maplestory.nexon.com/Ranking/Union?c=${encodeURIComponent(name)}`;
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
        this.#homeLevelData = await linkParse(this.#homeLevelURL);
        if (this.#homeLevelData('img[alt="메이플스토리 서비스 점검중!"]').length !== 0) {
            throw new Error('메이플 공식 홈페이지가 서비스 점검 중입니다.');
        }

        if (this.#homeLevelData('tr[class]').length !== 10) {
            this.#homeLevelURL += '&w=254'; // 리부트 서버 목록
            this.#homeLevelData = await linkParse(this.#homeLevelURL);
        }
        if (len < 1 || len > 12 || this.#homeLevelData('tr[class]').length !== 10) {
            return null; // 없는 캐릭터
        }

        let data = this.#homeLevelData('.search_com_chk > td');
        if (data.length === 0) {
            const nickList = this.#homeLevelData('tr[class] > td.left > dl > dt > a'); // 순위 리스트의 닉네임
            for (let i = 0; i < 10; i++) {
                if (this.#name.toLowerCase() === nickList.eq(i).text().toLowerCase()) {
                    this.#name = nickList.eq(i).text(); // 대소문자 정확한 이름으로 갱신
                    data = this.#homeLevelData('tr[class]').eq(i).find('td');
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
        this.#homeUnionData = await linkParse(this.#homeUnionURL);
        if (this.#homeUnionData('img[alt="메이플스토리 서비스 점검중!"]').length !== 0) {
            throw new Error('메이플 공식 홈페이지가 서비스 점검 중입니다.');
        }

        if (len < 1 || len > 12 || this.#homeUnionData('tr').length !== 12) {
            return null; // 유니온 기록이 없음
        }

        let data = this.#homeUnionData('.search_com_chk > td');
        if (data.length === 0) {
            const nickList = this.#homeUnionData('tr > td.left > dl > dt > a'); // 순위 리스트의 닉네임
            for (let i = 0; i < 10; i++) {
                if (this.#name.toLowerCase() === nickList.eq(i).text().toLowerCase()) {
                    this.#name = nickList.eq(i).text(); // 대소문자 정확한 이름으로 갱신
                    data = this.#homeUnionData('tr')
                        .eq(i + 2)
                        .find('td');
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
        this.#ggData = await linkParse(this.#ggURL); // this.#ggData는 함수
        if (this.#ggData('img[alt="검색결과 없음"]').length !== 0) {
            throw new Error('메이플 GG에서 캐릭터 정보를 가져올 수 없습니다.');
        } else if (this.#ggData('div.alert.alert-warning.mt-3').length !== 0) {
            throw new Error('메이플 GG 서버가 점검 중입니다.');
        } else if (
            /Bad Gateway|Error/.test(this.#ggData('title').text()) ||
            this.#ggData('div.flex-center.position-ref.full-height').length !== 0
        ) {
            throw new Error('메이플 GG 서버에 에러가 발생했습니다.');
        }

        if (
            this.#ggData('.d-block.font-weight-light').text().replace(/\s+/g, '') !== '마지막업데이트:오늘' ||
            this.#ggData('.container.mt-5.text-center > h3').text() === '검색결과가 없습니다.'
        ) {
            return false;
        } else {
            return true;
        }
    }

    async updateGG() {
        const start = Date.now();
        while (1) {
            try {
                const rslt = await linkJSON(`${this.#ggURL}/sync`);
                if (!rslt.error && rslt.done) {
                    this.#ggData = await linkParse(this.#ggURL);
                    return true; // 갱신성공
                }
            } catch {
                return false; // 갱신실패
            }
            if (Date.now() - start >= 20000) {
                return false; // 20초가 지나도 갱신 못했으면 갱신실패 판정
            }
            await setTimeout(500);
        }
    }

    Murung() {
        const murung = this.#ggData('.col-lg-3.col-6.mt-3.px-1').eq(0); // murung은 cheerio객체
        const nomurung = murung.find('.user-summary-no-data').length; // 0이면 기록 있고 1이면 기록 없음
        if (murung.length === 0 || nomurung) {
            return null;
        }

        const murungdate = murung.find('.user-summary-date > span').text().replace('기준일: ', ''); // 무릉 최고기록 날짜
        const murungtime = murung.find('.user-summary-duration').text(); // 무릉 클리어 시간 (0분 0초 형식)
        const murungfl = murung.find('.user-summary-floor.font-weight-bold').text().replace(/\s+/g, ''); // 무릉 최고 층수 (0층 형식)
        const murungjob = murung.find('.d-block.mb-1 > span').text().replace(/\s+/g, '').replace('/', ' / '); // 유저 레벨, 직업

        return [murungjob, murungfl, murungtime, murungdate];
    }

    Seed() {
        const seed = this.#ggData('.col-lg-3.col-6.mt-3.px-1').eq(1);
        const noseed = seed.find('.user-summary-no-data').length; // 0이면 기록 있고 1이면 기록 없음
        if (seed.length === 0 || noseed) {
            return null;
        }

        const seeddate = seed.find('.user-summary-date > span').text().replace('기준일: ', ''); // 시드 최고기록 날짜
        const seedtime = seed.find('.user-summary-duration').text(); // 시드 클리어 시간 (0분 0초 형식)
        const seedfl = seed.find('.user-summary-floor.font-weight-bold').text().replace(/\s+/g, ''); // 시드 최고 층수 (0층 형식)
        const seedjob = seed.find('.d-block.mb-1 > span').text().replace(/\s+/g, '').replace('/', ' / '); // 유저 레벨, 직업

        return [seedjob, seedfl, seedtime, seeddate];
    }

    Union() {
        const union = this.#ggData('.col-lg-3.col-6.mt-3.px-1').eq(2);
        const nounion = union.find('.user-summary-no-data').length; // 0이면 기록 있고 1이면 기록 없음
        if (union.length === 0 || nounion) {
            return null;
        }

        const lev = +union.find('.user-summary-level').text().slice(3); // 유니온 레벨, 숫자값
        const stat = +union.find('.d-block.mb-1 > span').contents().last().text().replace(/[\s,]/g, ''); // 유니온 전투력, 숫자값
        const coin = Math.floor(stat * 0.000000864); // 일일 코인 수급량, 숫자값
        const grade = union.find('.user-summary-tier-string.font-weight-bold').text(); // 유니온 등급

        return [lev, stat, coin, grade];
    }

    Achieve() {
        const achieve = this.#ggData('.col-lg-3.col-6.mt-3.px-1').eq(3);
        const noachieve = achieve.find('.user-summary-no-data').length; // 0이면 기록 있고 1이면 기록 없음
        if (achieve.length === 0 || noachieve) {
            return null;
        }

        const grade = achieve.find('.user-summary-tier-string.font-weight-bold').text(); // 업적 등급
        const score = achieve.find('.user-summary-level').text().slice(5); // 업적 점수
        const worldrank = achieve.find('.mb-2 > span').eq(0).text().replace(/\s+/g, ''); // 월드랭킹
        const allrank = achieve.find('.mb-2 > span').eq(1).text(); // 전체랭킹

        return [grade, score, worldrank, allrank];
    }

    Rank() {
        const rank = this.#ggData('.col-lg-2.col-md-4.col-sm-4.col-6.mt-3 > span');
        if (rank.length === 0) {
            return null;
        }

        const rslt = [];
        for (let i = 0; i < rank.length; i++) {
            rslt.push(rank.eq(i).text().replace(/\s+/g, '')); // 0위 형식
        }
        return rslt;
    }

    Coordi() {
        const coordi = this.#ggData('.character-coord__item-name');
        if (coordi.length === 0) {
            return null;
        }

        const rslt = [];
        for (let i = 0; i < coordi.length; i++) {
            rslt.push(coordi.eq(i).text());
        }
        return rslt;
    }

    ExpHistory() {
        const data = JSON.parse(/var\s+expHistoryLabels\s*=\s*(\[.+?\])\s*\n/.exec(this.#ggData.html())?.[1] ?? '[]');
        if (data.length === 0) {
            return null;
        }
        const date = JSON.parse(
            /columns\s*:\s*(\[\["x".+?\],\s*\["exp".+?\]\])\s*,/.exec(this.#ggData.html())?.[1] ?? '[]'
        );
        if (date.length === 0) {
            return null;
        }

        date[0].slice(1).forEach((v, i) => (data[i].date = v));

        return data; // 배열의 원소 구성: date, level, exp
    }

    LevelHistory() {
        const data = JSON.parse(
            /columns\s*:\s*(\[\["x".+?\],\s*\["level".+?\]\])\s*,/.exec(this.#ggData.html())?.[1] ?? '[]'
        );
        if (data.length === 0) {
            return null;
        }

        return data; // 0번째 배열 = 날짜, 1번째 배열 = 레벨 (각각 0번 인덱스는 제외 필요)
    }

    MurungHistory() {
        const data = this.#ggData('.text-center.px-2.font-size-14.align-middle');
        if (data.length === 0) {
            return null;
        }

        const date = [],
            murung = [];
        for (let i = 0; i < data.length; i += 6) {
            date.push(`${data.eq(i).find('span').text()}${data.eq(i).find('b').text()}`); // 날짜
            murung.push(
                `${data
                    .eq(i + 1)
                    .find('h5')
                    .text()} (${data
                    .eq(i + 1)
                    .find('span')
                    .text()})`
            ); // 무릉 기록
        }
        return [date, murung];
    }

    Collection() {
        const collection = this.#ggData('section.box.mt-3 .avatar-collection-item.col-lg-2.col-md-4.col-6');
        if (collection.length === 0) {
            return null;
        }

        const coordi = [],
            date = [];
        for (let i = 0; i < collection.length; i++) {
            coordi.push(collection.eq(i).find('img').attr('src')?.replace('Character/', 'Character/180/')); // 코디 이미지
            date.push(+/\d+/.exec(collection.eq(i).text())); // 날짜
        }
        return [coordi, date];
    }

    Level() {
        return +/\d+/.exec(this.#ggData('.user-summary-item').eq(0).text());
    }

    Job() {
        return this.#ggData('.user-summary-item').eq(1).text();
    }

    Popularity() {
        return this.#ggData('.user-summary-item > span').eq(1).text();
    }

    userImg(full = true) {
        const img = this.#ggData('meta[property="og:image"]').attr('content');
        return full ? img?.replace('Character/', 'Character/180/') : img;
    }

    serverImg() {
        return this.#ggData('div.col-lg-8 > h3 > img.align-middle').attr('src');
    }

    serverName() {
        return this.#ggData('div.col-lg-8 > h3 > img.align-middle').attr('alt');
    }

    lastActiveDay() {
        return (
            this.#ggData('.col-6.col-md-8.col-lg-6 .font-size-12.text-white')
                .text()
                .replace(/(\d+)\s+/, '$1') || '마지막 활동일: 알 수 없음'
        );
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
        this.#ggData = await linkParse(`${this.#ggURL}/members?sort=level`); // this.#ggData는 함수
        if (this.#ggData('img[alt="404 ERROR"]').length !== 0) {
            throw new Error('메이플 GG에서 길드 정보를 가져올 수 없습니다.');
        } else if (this.#ggData('div.alert.alert-warning.mt-3').length !== 0) {
            throw new Error('메이플 GG 서버가 점검 중입니다.');
        } else if (
            /Bad Gateway|Error/.test(this.#ggData('title').text()) ||
            this.#ggData('div.flex-center.position-ref.full-height').length !== 0
        ) {
            throw new Error('메이플 GG 서버에 에러가 발생했습니다.');
        }

        this.#memberData = this.#ggData('.pt-2.bg-white.rounded.border.font-size-0.line-height-1');
        return updateResult;
    }

    async memberDataList() {
        const rslt = [];
        const memberList = this.#memberData.map((_, v) => new MapleUser(this.#ggData(v).find('.mb-2 a').eq(1).text()));
        const updateRslt = await Promise.all(
            memberList.map(async (_, v) => (await v.isLatest()) || (await v.updateGG()))
        );
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
            try {
                const rslt = await linkJSON(`${this.#ggURL}/sync`);
                if (rslt.done) {
                    return true; // 갱신성공
                } else if (rslt.error) {
                    return false; // 갱신실패
                }
            } catch {
                return false; // 갱신실패
            }
            if (Date.now() - start >= 20000) {
                return false; // 20초가 지나도 갱신 못했으면 갱신실패 판정
            }
            await setTimeout(500);
        }
    }
}
