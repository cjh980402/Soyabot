class item {
    constructor() {
        this.now = 0;
        this.goal = 0;
        this.star = 0;
        this.sum = 0;
        this.fail = 0;
        this.dest = 0;
        this.chance = 0;
        this.temp = 0;
        this.starcat = 0;
        this.sale = 0;
        this.nodest = 0;
        this.lev = 0;
        this.limit = 0;
        this.initial = 0;
    }

    doingStarforce(data) {
        const len = data.length;
        if (len < 3 || len > 6) {
            return "잘못된 형식입니다.";
        }
        else if (data[2] == 25) {
            return "과부하 방지를 위해 24성까지로 제한합니다.";
        }

        this.lev = data[0]; //아이템 렙제
        if (this.lev < 98 || this.lev > 200) {
            return "레벨 제한을 다시 입력해주세요.";
        }
        if (this.lev >= 138) {
            this.limit = 25;
        }
        else if (this.lev >= 128) {
            this.limit = 20;
        }
        else if (this.lev >= 118) {
            this.limit = 15;
        }
        else if (this.lev >= 108) {
            this.limit = 10;
        }
        else if (this.lev >= 98) {
            this.limit = 8;
        }

        this.initial = data[1]; //강화 시작 수치
        if (this.initial < 0 || this.initial > this.limit) {
            return "강화 시작 수치를 다시 입력해주세요.";
        }

        this.goal = data[2]; //강화 목표 수치
        if (this.goal < this.initial || this.goal > this.limit) {
            return "강화 목표 수치를 다시 입력해주세요.";
        }

        this.starcat = (len < 4 ? 1 : data[3]); // 스타캐치 여부
        this.sale = (len < 5 ? 0 : data[4]); // 이벤트 종류 : 30퍼 할인 = 1, 100퍼 이벤 = 2, 미적용 = 그 외
        if (this.goal > 12 && len == 6) {
            this.nodest = data[5]; //파방 종류 : 12~17 파방 = 1, 15~17 파방 = 2, 미적용 = 그 외
        }

        console.log(`<일반> 레벨 제한 : ${this.lev}, 시작 : ${this.initial}성, 목표 : ${this.goal}성\n스타캐치 : ${this.starcat}, 이벤트 : ${this.sale}, 파방 : ${this.nodest}`);

        this.star = this.initial;
        while (this.star < this.goal) {
            this.starforce();
        }

        return `${this.star}성까지 강화완료\n소비 메소 : ${(this.sum).toLocaleString()}메소\n찬스 타임 : ${(this.chance).toLocaleString()}회\n실패 횟수 : ${(this.fail).toLocaleString()}회\n파괴 횟수 : ${(this.dest).toLocaleString()}회`;
    }
    starforce() {
        const pmprob = [[95, 0], [90, 0], [85, 0], [85, 0], [80, 0], [75, 0], [70, 0], [65, 0], [60, 0], [55, 0], [50, 0], [45, 0], [40, 1], [35, 2], [30, 2], [30, 3], [30, 3], [30, 3], [30, 3], [30, 3], [30, 10], [30, 10], [3, 20], [2, 30], [1, 40]];
        //확률을 백분율 수치로 저장
        let Temp = 100; // 파괴방지 구간
        let TEMP = 1; // 할인 이벤트 비율

        if (this.starcat != 1) {
            this.starcat = 0;
        }
        const sucprob = (this.strcat ? 1050 : 1000) * pmprob[this.star][0]; //백분율->십만분율 변환, 스타캐치는 곱적용 5%
        let destprob = (100000 - sucprob) * (1000 * pmprob[this.star][1]) / 100000; //파괴확률=조건부 확률, 백분율->십만분율 변환

        if (this.nodest == 1) {
            Temp = 12;
        }
        else if (this.nodest == 2) {
            Temp = 15;
        }
        if (this.sale == 1) { //30퍼 세일
            TEMP = 0.7;
        }

        if (this.temp == -2) { //찬스타임

            this.chance++;
            this.star++;
            this.temp = 0;
            this.sum += TEMP * meso(this.star, this.lev);
            return;
        }
        if (this.sale == 2 && this.star < 20 && this.star % 5 == 0) { //100퍼 이벤

            this.star++;
            this.temp = 0;
            this.sum += TEMP * meso(this.star, this.lev);
            return;
        }
        if (this.star >= Temp && this.star <= 16) { //파괴방지

            this.sum += (1 + TEMP) * meso(this.star, this.lev);
            destprob = 0;
        }
        else { //일반적인 경우
            this.sum += TEMP * meso(this.star, this.lev);
        }

        this.sum = Math.round(this.sum);
        const i = Math.random() * 100000;

        if (i < sucprob) { //성공
            this.star++;
            this.temp = 0;
        }
        else if (i < sucprob + destprob) { //파괴
            this.star = 12;
            this.dest++;
            this.temp = 0;
        }
        else { //실패
            if (this.star > 10 && this.star % 5) { // 10성 이하와, 5의 배수구간은 완충 구간
                this.star--;
                this.temp--;
            }
            this.fail++;
        }
    }

}

function meso(star, lev) {
    let temp = 0;
    if (star >= 15) {
        temp = Math.pow(star * 1 + 1, 2.7) / 200.0;
    }
    else if (star >= 10) {
        temp = Math.pow(star * 1 + 1, 2.7) / 400.0;
    }
    else {
        temp = (star * 1 + 1) / 25.0;
    }
    return (Math.round((1000 + Math.pow(lev, 3) * temp) / 100.0) * 100); // 십의자리에서 반올림
}
module.exports = item;