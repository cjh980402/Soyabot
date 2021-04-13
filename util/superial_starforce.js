const probTable = [
    [50, 0],
    [50, 0],
    [45, 0],
    [40, 0],
    [40, 0],
    [40, 3],
    [40, 5],
    [40, 7],
    [40, 7],
    [37, 15],
    [35, 20],
    [35, 25],
    [3, 50],
    [2, 50],
    [1, 50]
];
// 확률을 백분율 수치로 저장

function meso(lev) {
    return Math.round(Math.pow(lev, 3.56) / 100) * 100; // 십의자리에서 반올림
}

class SuperialItem {
    constructor() {
        this.now = 0;
        this.goal = 0;
        this.star = 0;
        this.sum = 0;
        this.fail = 0;
        this.dest = 0;
        this.chance = 0;
        this.checkdown = 0;
        this.starcat = 0;
        this.lev = 150;
        this.limit = 15;
        this.initial = 0;
    }

    doingStarforce(data) {
        const len = data.length;
        if (!data.every((v) => !isNaN(v)) || (len != 3 && len != 2)) {
            return '잘못된 형식입니다.';
        } else if (data[1] == 15) {
            return '과부하 방지를 위해 14성까지로 제한합니다.';
        }

        this.initial = data[0]; // 강화 시작 수치
        if (this.initial < 0 || this.initial > this.limit) {
            return '강화 시작 수치를 다시 입력해주세요.';
        }

        this.goal = data[1]; // 강화 목표 수치
        if (this.goal < this.initial || this.goal > this.limit) {
            return '강화 목표 수치를 다시 입력해주세요.';
        }

        this.starcat = +(data[2] == 1); // 스타캐치 여부

        console.log(`<슈페리얼> 레벨 제한: ${this.lev}, 시작: ${this.initial}성, 목표: ${this.goal}성\n스타캐치: ${this.starcat}`);

        this.star = this.initial;
        while (this.star < this.goal) {
            this.starforce();
        }

        return `${this.star}성까지 강화완료\n소비 메소: ${this.sum.toLocaleString()}메소\n찬스 타임: ${this.chance.toLocaleString()}회\n실패 횟수: ${this.fail.toLocaleString()}회\n파괴 횟수: ${this.dest.toLocaleString()}회`;
    }

    starforce() {
        const sucprob = (this.strcat ? 1050 : 1000) * probTable[this.star][0]; // 백분율 → 십만분율 변환, 스타캐치는 곱적용 5%
        const destprob = ((100000 - sucprob) * (1000 * probTable[this.star][1])) / 100000; // 파괴확률 = 조건부 확률, 백분율 → 십만분율 변환

        this.sum += meso(this.lev); // 항상 고정비용

        if (this.checkdown == -2) {
            // 찬스타임
            this.chance++;
            this.star++;
            this.checkdown = 0;
            return;
        }

        const i = Math.random() * 100000;

        if (i < sucprob) {
            // 성공
            this.star++;
            this.checkdown = 0;
        } else if (i < sucprob + destprob) {
            // 파괴
            this.star = 0;
            this.dest++;
            this.checkdown = 0;
        } else {
            // 실패
            if (this.star > 0) {
                // 슈페리얼은 완충구간이 없음
                this.star--;
                this.checkdown--;
            }
            this.fail++;
        }
    }
}

module.exports = SuperialItem;
