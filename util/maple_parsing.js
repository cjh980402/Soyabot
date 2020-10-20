const cheerio = require('cheerio');
const fetch = require('node-fetch');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function linkParse(link) {
    try {
        return cheerio.load(await (await fetch(encodeURI(link))).text()); // encodeURI는 한글 주소의 경우 필수
    }
    catch (e) {
        return e;
    }
}

class Maple {
    // 생성자
    constructor(name) {
        this.name = name;
        this.ggurl = `https://maple.gg/u/${this.name}`;
        this.ggdata = null;
        this.homeunion = null;
        this.homelevel = null;
    }
    // 이하 모두 매소드
    async isExist() {
        let len = this.name.length;
        for (let c of this.name) {
            if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(c)) {
                len++;
            }
        }
        let temp = `Ranking/World/Total?c=${this.name}`; // 일반섭
        this.homelevel = await linkParse(`https://maplestory.nexon.com/${temp}`);
        if (this.homelevel("img[alt='메이플스토리 서비스 점검중!']").length != 0) {
            throw new Error("메이플 공식 홈페이지가 서비스 점검 중입니다.");
        }

        if (this.homelevel("tr[class]").length == 0) {
            temp += "&w=254"; // 리부트
            this.homelevel = await linkParse(`https://maplestory.nexon.com/${temp}`);
        }
        if (len < 1 || len > 12 || this.homelevel("tr[class]").length == 0) {
            return null; // 없는 캐릭터
        }
        return temp; // 있는 캐릭터
    }
    homeLevel() {
        let data = this.homelevel(".search_com_chk > td");
        if (data.length == 0) {
            const tmp = this.homelevel("tr[class] > td.left > dl > dt > a"); // 순위 리스트의 닉네임
            for (let i = 0; i < 10; i++) {
                if (this.name.toLowerCase() == tmp.eq(i).text().toLowerCase()) {
                    data = this.homelevel("tr[class]").eq(i).find("td");
                    break;
                }
            }
            if (data.length == 0) {
                return null; // 공홈이 오류나서 순위 리스트가 떠도 해당 캐릭터는 없는 경우
            }
        }

        const job = data.eq(1).find("dl > dd").text().split(' / ')[1]; // 직업
        const lev = data.eq(2).text().substr(3); // 레벨
        const exper = data.eq(3).text(); // 경험치
        const popul = data.eq(4).text(); // 인기도
        const guild = data.eq(5).text(); // 길드

        return [lev, exper, popul, guild, job];
    }
    async isMain() {
        let len = this.name.length;
        for (let c of this.name) {
            if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(c)) {
                len++;
            }
        }
        this.homeunion = await linkParse(`https://maplestory.nexon.com/Ranking/Union?c=${this.name}`);
        if (this.homeunion("img[alt='메이플스토리 서비스 점검중!']").length != 0) {
            throw new Error("메이플 공식 홈페이지가 서비스 점검 중입니다.");
        }

        if (len < 1 || len > 12 || this.homeunion("tr").length < 12) {
            return 0; // 유니온 기록이 없음
        }
        return 1; // 유니온 기록이 있음
    }
    homeUnion() {
        let data = this.homeunion(".search_com_chk > td");
        if (data.length == 0) {
            const tmp = this.homeunion("tr > td.left > dl > dt > a"); // 순위 리스트의 닉네임
            for (let i = 0; i < 10; i++) {
                if (this.name.toLowerCase() == tmp.eq(i).text().toLowerCase()) {
                    data = this.homeunion("tr").eq(i + 2).find("td");
                    break;
                }
            }
            if (data.length == 0) {
                return null; // 공홈이 오류나서 순위 리스트가 떠도 해당 캐릭터는 없는 경우
            }
        }

        const job = data.eq(1).find("dl > dd").text().split(' / ')[1]; // 직업
        const lev = data.eq(2).text(); // 유니온 레벨
        const stat = data.eq(3).text(); // 유니온 전투력
        const coin = Math.floor(stat.replace(/,/gi, '') * 0.000000864); // 일일 코인 수급량

        return [lev, stat, coin, job];
    }
    async isLatest() {
        this.ggdata = await linkParse(this.ggurl); // this.ggdata는 함수
        if (this.ggdata('div.alert.alert-warning.mt-3').length != 0) {
            throw new Error("메이플 GG 서버가 점검 중입니다.");
        }
        else if (this.ggdata('div.flex-center.position-ref.full-height').length != 0) {
            throw new Error("메이플 GG 서버에 에러가 발생했습니다.");
        }

        if (this.ggdata(".d-block.font-weight-light").text().replace(/(\s*)/g, "") != "마지막업데이트:오늘"
            || this.ggdata(".container.mt-5.text-center > h3").text() == "검색결과가 없습니다.") {
            return 0;
        }
        else {
            return 1;
        }
    }
    async updateGG() {
        const start = Date.now();
        let rslt;
        while (1) {
            try {
                rslt = JSON.parse((await linkParse(`${this.ggurl}/sync`)).text());
                if (rslt.error == false && rslt.done == true) {
                    this.ggdata = await linkParse(this.ggurl);
                    return 1; // 갱신성공
                }
            }
            catch (e) {
                return 0; // 갱신실패
            }
            if (Date.now() - start >= 20 * 1000) {
                return 0; // 갱신실패
            }
            await sleep(100);
        }
    }
    Murung() {
        const murung = this.ggdata(".col-lg-3.col-6.mt-3.px-1").eq(0); // murung은 cheerio객체
        const nomurung = murung.find(".user-summary-no-data").length; // 0이면 기록 있고 1이면 기록 없음
        if (nomurung) {
            return null;
        }

        const murungdate = murung.find(".user-summary-date > span").text().replace('기준일: ', ''); // 무릉 최고기록 날짜
        const murungtime = murung.find(".user-summary-duration").text(); // 무릉 클리어 시간
        const murungfl = murung.find(".user-summary-floor.font-weight-bold").text().replace(/(\s*)/g, ""); // 무릉 최고 층수
        const murungjob = murung.find(".d-block.mb-1 > span").text().replace(/(\s*)/g, "").replace('/', ' / '); // 유저 레벨, 직업

        return [murungjob, murungfl, murungtime, murungdate];
    }
    Seed() {
        const seed = this.ggdata(".col-lg-3.col-6.mt-3.px-1").eq(1);
        const noseed = seed.find(".user-summary-no-data").length; // 0이면 기록 있고 1이면 기록 없음
        if (noseed) {
            return null;
        }

        const seeddate = seed.find(".user-summary-date > span").text().replace('기준일: ', ''); // 시드 최고기록 날짜
        const seedtime = seed.find(".user-summary-duration").text(); // 시드 클리어 시간
        const seedfl = seed.find(".user-summary-floor.font-weight-bold").text().replace(/(\s*)/g, ""); // 시드 최고 층수
        const seedjob = seed.find(".d-block.mb-1 > span").text().replace(/(\s*)/g, "").replace('/', ' / '); // 유저 레벨, 직업

        return [seedjob, seedfl, seedtime, seeddate];
    }
    Union() {
        const union = this.ggdata(".col-lg-3.col-6.mt-3.px-1").eq(2);
        const nounion = union.find(".user-summary-no-data").length; // 0이면 기록 있고 1이면 기록 없음
        if (nounion) {
            return null;
        }

        const lev = union.find(".user-summary-level").text().substr(3).replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 유니온 레벨
        const stat = union.find(".d-block.mb-1 > span").eq(0).contents().last().text().trim(); // 유니온 전투력
        const coin = Math.floor(stat.replace(/,/gi, '') * 0.000000864); // 일일 코인 수급량

        return [lev, stat, coin];
    }
    Achieve() {
        const achieve = this.ggdata(".col-lg-3.col-6.mt-3.px-1").eq(3);
        const noachieve = achieve.find(".user-summary-no-data").length; // 0이면 기록 있고 1이면 기록 없음
        if (noachieve) {
            return null;
        }

        const grade = achieve.find(".user-summary-tier-string.font-weight-bold").text(); // 업적 등급
        const score = achieve.find(".user-summary-level").text().substr(5); // 업적 점수
        const worldrank = achieve.find(".mb-2 > span").eq(0).text().replace(' ', '').replace(/(\s*)/g, ""); // 월드랭킹
        const allrank = achieve.find(".mb-2 > span").eq(1).text(); // 전체랭킹

        return [grade, score, worldrank, allrank];
    }
    Rank() {
        const rank = this.ggdata('.col-lg-2.col-md-4.col-sm-4.col-6.mt-3 > span');

        if (rank.length == 0) {
            return null;
        }

        let rslt = new Array(4);
        for (let i = 0; i < 4; i++) {
            rslt[i] = rank.eq(i).text().replace(/(\s*)/g, "");
        }
        return rslt;
    }
    Coordi() {
        const coordi = this.ggdata(".character-coord__item-name");

        if (coordi.length == 0) {
            return null;
        }

        let rslt = new Array(7);
        for (let i = 0; i < 7; i++) {
            rslt[i] = coordi.eq(i).text();
        }
        return rslt;
    }
    Level() {
        return this.ggdata(".user-summary-item").eq(0).text().substr(3);
    }
    Job() {
        return this.ggdata(".user-summary-item").eq(1).text();
    }
    Popularity() {
        return this.ggdata(".user-summary-item > span").eq(1).text();
    }
    userImg() {
        return this.ggdata("meta[property='og:image']").attr("content").replace("Character/", "Character/180/");
    }
    serverImg() {
        return this.ggdata("div.col-lg-8 > h3 > img.align-middle").attr("src");
    }
    LevelHistory() {
        let data = this.ggdata("body > script:nth-child(15)").html()
            .replace(/\\u[\da-fA-F]{4}/g, (m) => String.fromCharCode(parseInt(m.substr(2), 16)));
        // \u코드값 형태로 나온 문자들을 실제 문자로 변환하는 인코딩을 끝에 추가함
        data = JSON.parse(/\[\[.+\]\]/.exec(data));

        const date = data[0].slice(1);
        const level = data[1].slice(1);

        return [date, level];
    }
    MurungHistory() {
        const data = this.ggdata('.text-center.px-2.font-size-14.align-middle');

        if (data.length == 0) {
            return null;
        }

        const date = [], murung = [];
        for (let i = 0; i < data.length; i += 6) {
            date.push(data.eq(i).find('span').text() + data.eq(i).find('b').text()); // 날짜
            murung.push(`${data.eq(i + 1).find('h5').text()} (${data.eq(i + 1).find('span').text()})`); // 무릉 기록
        }
        return [date, murung];
    }
}

module.exports = Maple;