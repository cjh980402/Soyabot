const Discord = require('discord.js');
const fetch = require('node-fetch');
const { decodeHTML } = require('entities');
const { inspect } = require('util');

Object.defineProperty(Discord.Message.prototype, 'fullContent', {
    get: async function () {
        if (this.type == 'DEFAULT' && this.attachments.first()?.name == 'message.txt') {
            return (await fetch(this.attachments.first().url)).text();
        } else {
            return this.content;
        }
    }
});

Object.defineProperty(Number.prototype, 'toLocaleUnitString', {
    value: function (locales = Intl.NumberFormat().resolvedOptions().locale, count = 5) {
        // locales는 출력할 형식의 로케일, count는 출력할 단위의 개수
        const localeUnitNames = {
            'ko-KR': ['경', '조', '억', '만', ''],
            'ja-JP': ['京', '兆', '億', '万', ''],
            'zh-CN': ['京', '兆', '亿', '万', ''],
            'en-US': ['Trillion', 'Billion', 'Million', 'Thousand', '']
        };
        const localeUnitStd = {
            'ko-KR': [10000000000000000, 10000],
            'ja-JP': [10000000000000000, 10000],
            'zh-CN': [10000000000000000, 10000],
            'en-US': [1000000000000, 1000]
        };
        const rslt = [];
        let num = +this; // 현재 Number 값의 복사본

        const unitName = localeUnitNames[locales];
        const unitStd = localeUnitStd[locales];
        if (!unitName || !unitStd) {
            throw new RangeError('Incorrect locale information provided');
        }

        for (let i = 0, unitNum = unitStd[0]; i < unitName.length; num %= unitNum, unitNum /= unitStd[1], i++) {
            const tmp = Math.floor(num / unitNum);
            if (tmp > 0 && rslt.length < count) {
                rslt.push(`${tmp}${unitName[i]}`);
            }
        }
        return rslt.join(' ') || '0';
    }
});

Object.defineProperty(String.prototype, 'decodeHTML', {
    value: function () {
        return decodeHTML(this).replace(/<br>/gi, '\n');
    }
});

Object.defineProperty(String.prototype, 'hashCode', {
    value: function () {
        let h = 0;
        for (let i = 0; i < this.length; i++) {
            h = (31 * h + this.codePointAt(i)) | 0; // 연산 후 signed 32-bit 정수로 변환
        }
        return h;
    }
});

Object.defineProperty(Object.prototype, '_i', {
    // util.inspect의 결과 출력
    value: function (dep = 2) {
        return inspect(this, { depth: dep });
    }
});

Object.defineProperty(Object.prototype, '_p', {
    // 객체의 키와 값 출력
    get: function () {
        return Object.getOwnPropertyNames(this).map((v) => {
            try {
                return `${v}: ${this[v]}`;
            } catch (e) {
                return `${v}: error`;
            }
        }).join('\n');
    }
});

Object.defineProperty(Object.prototype, '_k', {
    // 객체의 키만 출력
    get: function () {
        return Object.getOwnPropertyNames(this).join('\n');
    }
});

Object.defineProperty(Object.prototype, '__p', {
    // 상위 프로토타입의 키와 값 출력
    get: function () {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).map((v) => {
            try {
                return `${v}: ${this[v]}`;
            } catch (e) {
                return `${v}: error`;
            }
        }).join('\n');
    }
});

Object.defineProperty(Object.prototype, '__k', {
    // 상위 프로토타입의 키만 출력
    get: function () {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).join('\n');
    }
});

module.exports = Discord;
