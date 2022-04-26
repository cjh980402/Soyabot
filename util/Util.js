export class Util extends null {
    static deduplication(arr) {
        return [...new Set(arr)];
    }

    static shuffle(arr, indexStart = 0, indexEnd = arr.length) {
        for (let i = indexEnd - 1; i > indexStart; i--) {
            const j = Math.floor(Math.random() * (i - indexStart + 1)) + indexStart;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr; // 체이닝을 위한 배열 반환
    }

    static toUnitString(num, count = 5) {
        // count는 출력할 단위의 개수
        const unitName = ['경', '조', '억', '만', ''];
        const unitStd = 10000;
        const rslt = [];
        let unitNum = unitStd ** (unitName.length - 1);
        let absNum = Math.abs(num);

        for (const unit of unitName) {
            const quotient = Math.floor(absNum / unitNum);
            if (quotient > 0 && rslt.length < count) {
                rslt.push(`${quotient}${unit}`);
            }
            absNum %= unitNum;
            unitNum /= unitStd;
        }
        return `${num < 0 ? '- ' : ''}${rslt.join(' ') || '0'}`;
    }

    static toDurationString(num) {
        const hours = Math.floor(num / 3600);
        const minutes = Math.floor((num % 3600) / 60);
        const seconds = Math.floor(num % 60);

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            return `${minutes}:${String(seconds).padStart(2, '0')}`;
        }
    }

    static splitMessage(text, { maxLength = 2000, char = '\n', prepend = '', append = '' } = {}) {
        if (text.length <= maxLength) {
            return [text];
        }

        const splitText = text.split(char);
        if (splitText.some((elem) => elem.length > maxLength)) {
            throw new RangeError('SPLIT_MAX_LEN');
        }

        let msg = '';
        const messages = [];
        for (const chunk of splitText) {
            if (msg && (msg + char + chunk + append).length > maxLength) {
                messages.push(msg + append);
                msg = prepend;
            }
            msg += (msg && msg !== prepend ? char : '') + chunk;
        }

        return messages.concat(msg).filter(Boolean);
    }
}
