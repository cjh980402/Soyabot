const Discord = require('discord.js-light');
const fetch = require('node-fetch');
const YouTubeAPI = require('simple-youtube-api');
const Constants = require('simple-youtube-api/src/util/Constants');
const Video = require('simple-youtube-api/src/structures/Video');
const { decodeHTML } = require('entities');
const { inspect } = require('util');
const originReply = Discord.Message.prototype.reply; // 기본으로 정의된 reply 메소드
globalThis.sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

Object.defineProperty(Discord, 'clientOption', {
    value: {
        cacheGuilds: true, // 전체 길드 캐싱
        cacheRoles: true, // 권한 관련 코드 사용 시 필요
        cacheOverwrites: true, // 권한 관련 코드 사용 시 필요
        cacheChannels: false,
        cacheEmojis: false,
        cachePresences: false,
        messageCacheMaxSize: 0,
        messageEditHistoryMaxSize: 0,
        retryLimit: 3,
        ws: { intents: ['GUILDS', 'GUILD_VOICE_STATES', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS'] }
    }
});

Object.defineProperty(Discord.Message.prototype, 'fullContent', {
    get: async function () {
        if (this.type === 'DEFAULT' && this.attachments.first()?.name === 'message.txt') {
            return (await fetch(this.attachments.first().url)).text();
        } else {
            return this.content;
        }
    }
});

Object.defineProperty(Discord.Message.prototype, 'reply', {
    // failIfNotExists의 값을 false로 하기 위한 메소드 재정의
    value: function (content, options = {}) {
        options.reply = { failIfNotExists: false };
        return originReply.call(this, content, options);
    }
});

Object.defineProperty(YouTubeAPI.prototype, 'getVideosByIDs', {
    value: async function (ids, options = {}) {
        Object.assign(options, { part: Constants.PARTS.Videos, id: ids });
        const result = await this.request.make(Constants.ENDPOINTS.Videos, options);
        if (result.items.length > 0) {
            return result.items.map((v) => (v ? new Video(this, v) : null));
        } else {
            throw new Error(`resource ${result.kind} not found`);
        }
    }
});

Object.defineProperty(Array.prototype, 'asyncFilter', {
    // async 함수를 사용 가능한 Array의 filter 메소드 구현
    value: async function (callback) {
        const fail = Symbol();
        return (await Promise.all(this.map(async (v) => ((await callback(v)) ? v : fail)))).filter((v) => v !== fail);
    }
});

Object.defineProperty(Number.prototype, 'toLocaleUnitString', {
    value: function (locales = Intl.NumberFormat().resolvedOptions().locale, count = 5) {
        // locales는 출력할 형식의 로케일, count는 출력할 단위의 개수
        const localeUnits = {
            'ko-KR': [['경', '조', '억', '만', ''], 10000],
            'ja-JP': [['京', '兆', '億', '万', ''], 10000],
            'zh-CN': [['京', '兆', '亿', '万', ''], 10000],
            'en-US': [['Trillion', 'Billion', 'Million', 'Thousand', ''], 1000],
            'IEC': [['Ti', 'Gi', 'Mi', 'Ki', ''], 1024],
            'SI': [['T', 'G', 'M', 'k', ''], 1000]
        };

        if (!localeUnits[locales]) {
            throw new RangeError('Incorrect locale information provided');
        }
        const unitName = localeUnits[locales][0];
        const unitStd = localeUnits[locales][1];
        const rslt = [];

        for (let i = 0, unitNum = unitStd ** (unitName.length - 1), num = Math.abs(this); i < unitName.length; num %= unitNum, unitNum /= unitStd, i++) {
            const quotient = Math.floor(num / unitNum);
            if (quotient > 0 && rslt.length < count) {
                rslt.push(`${quotient}${unitName[i]}`);
            }
        }
        return `${this < 0 ? '- ' : ''}${rslt.join(' ') || '0'}`;
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
        return Object.getOwnPropertyNames(this)
            .map((v) => {
                try {
                    return `${v}: ${this[v]}`;
                } catch {
                    return `${v}: error`;
                }
            })
            .join('\n');
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
        return Object.getPrototypeOf(this)._p;
    }
});

Object.defineProperty(Object.prototype, '__k', {
    // 상위 프로토타입의 키만 출력
    get: function () {
        return Object.getPrototypeOf(this)._k;
    }
});

module.exports = Discord;
