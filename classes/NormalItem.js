const probTable = [
    [95, 0],
    [90, 0],
    [85, 0],
    [85, 0],
    [80, 0],
    [75, 0],
    [70, 0],
    [65, 0],
    [60, 0],
    [55, 0],
    [50, 0],
    [45, 0],
    [40, 0],
    [35, 0],
    [30, 0],
    [30, 3],
    [30, 3],
    [30, 3],
    [30, 4],
    [30, 4],
    [30, 10],
    [30, 10],
    [3, 20],
    [2, 30],
    [1, 40]
];
// 확률을 백분율 수치로 저장

function meso(star, lev) {
    let coefficient = 0;
    if (star >= 15) {
        coefficient = (star + 1) ** 2.7 / 200;
    } else if (star === 14) {
        coefficient = (star + 1) ** 2.7 / 75;
    } else if (star === 13) {
        coefficient = (star + 1) ** 2.7 / 110;
    } else if (star === 12) {
        coefficient = (star + 1) ** 2.7 / 150;
    } else if (star === 11) {
        coefficient = (star + 1) ** 2.7 / 220;
    } else if (star === 10) {
        coefficient = (star + 1) ** 2.7 / 400;
    } else {
        coefficient = (star + 1) / 25;
    }
    return Math.round((1000 + lev ** 3 * coefficient) / 100) * 100; // 십의자리에서 반올림
}

export class NormalItem {
    #goal = 0;
    #star = 0;
    #sum = 0;
    #fail = 0;
    #dest = 0;
    #chance = 0;
    #checkdown = 0;
    #starcat = 0;
    #event = 0;
    #nodest = 0;
    #lev = 0;
    #limit = 0;
    #initial = 0;

    doingStarforce(data) {
        if (data.some((v) => isNaN(v)) || data.length < 3 || data.length > 6) {
            return '잘못된 형식입니다.';
        } else if (data[2] === 25) {
            return '과부하 방지를 위해 24성까지로 제한합니다.';
        }

        this.#lev = data[0]; // 아이템 렙제
        if (this.#lev < 98 || this.#lev > 250) {
            return '레벨 제한을 다시 입력해주세요.';
        }
        if (this.#lev >= 138) {
            this.#limit = 25;
        } else if (this.#lev >= 128) {
            this.#limit = 20;
        } else if (this.#lev >= 118) {
            this.#limit = 15;
        } else if (this.#lev >= 108) {
            this.#limit = 10;
        } else if (this.#lev >= 98) {
            this.#limit = 8;
        }

        this.#initial = data[1]; // 강화 시작 수치
        if (this.#initial < 0 || this.#initial > this.#limit) {
            return '강화 시작 수치를 다시 입력해주세요.';
        }

        this.#goal = data[2]; // 강화 목표 수치
        if (this.#goal < this.#initial || this.#goal > this.#limit) {
            return '강화 목표 수치를 다시 입력해주세요.';
        }

        this.#starcat = +(data[3] === 1); // 스타캐치 여부: 적용 = 1, 미적용 = 그 외
        this.#event = data[4] ?? 0; // 이벤트 종류: 30퍼 할인 = 1, 100퍼 이벤 = 2, 10성 이하 1+1 = 3, 미적용 = 그 외
        this.#nodest = +(data[5] === 1); // 파방 종류: 15~17 파방 = 1, 미적용 = 그 외

        this.#star = this.#initial;
        while (this.#star < this.#goal) {
            this.#starforce();
        }

        return `${
            this.#star
        }성까지 강화완료\n소비 메소: ${this.#sum.toLocaleString()}메소\n찬스 타임: ${this.#chance.toLocaleString()}회\n실패 횟수: ${this.#fail.toLocaleString()}회\n파괴 횟수: ${this.#dest.toLocaleString()}회`;
    }

    #starforce() {
        let startNodest = 100; // 파괴방지 구간
        let afterSaleRate = 1; // 할인 후 가격 비율

        const sucprob = (this.#starcat ? 1050 : 1000) * probTable[this.#star][0]; // 백분율 → 십만분율 변환, 스타캐치는 곱적용 5%
        let destprob = ((100000 - sucprob) * (1000 * probTable[this.#star][1])) / 100000; // 파괴확률 = 조건부 확률, 백분율 → 십만분율 변환

        if (this.#nodest === 1) {
            startNodest = 15;
        }
        if (this.#event === 1) {
            // 30퍼 세일
            afterSaleRate = 0.7;
        }

        if (this.#checkdown === -2) {
            // 찬스타임
            this.#chance++;
            this.#star++;
            this.#checkdown = 0;
            this.#sum += afterSaleRate * meso(this.#star, this.#lev);
            return;
        }
        if (this.#event === 2 && this.#star < 20 && this.#star % 5 === 0) {
            // 100퍼 이벤
            this.#star++;
            this.#checkdown = 0;
            this.#sum += afterSaleRate * meso(this.#star, this.#lev);
            return;
        }

        if (destprob && this.#star >= startNodest && this.#star <= 16) {
            // 파괴방지
            this.#sum += (1 + afterSaleRate) * meso(this.#star, this.#lev);
            destprob = 0;
        } else {
            // 일반적인 경우
            this.#sum += afterSaleRate * meso(this.#star, this.#lev);
        }

        this.#sum = Math.round(this.#sum);
        const i = Math.random() * 100000;

        if (i < sucprob) {
            // 성공
            this.#star += this.#event === 3 && this.#star <= 10 ? 2 : 1; // 1 + 1 이벤이면 2단계 상승
            this.#checkdown = 0;
        } else if (i < sucprob + destprob) {
            // 파괴
            this.#star = 12;
            this.#dest++;
            this.#checkdown = 0;
        } else {
            // 실패
            if (this.#star > 15 && this.#star % 5) {
                // 15성 이하와, 5의 배수구간은 완충 구간
                this.#star--;
                this.#checkdown--;
            }
            this.#fail++;
        }
    }
}
