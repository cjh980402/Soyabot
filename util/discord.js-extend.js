const Discord = require("../util/discord.js-extend");
const util = require('util');
const fetch = require("node-fetch");
const { decodeHTML } = require("entities");

Object.defineProperty(Discord.Message.prototype, "replyTo", {
    value: async function (content, options = {}) {
        options.replyTo = this.id;
        return this.channel.send(content, options);
    }
});

Object.defineProperty(Discord.Message.prototype, "fullContent", {
    get: async function () {
        if (this.type == "DEFAULT" && this.attachments.first()?.name == "message.txt") {
            return (await fetch(this.attachments.first().url)).text();
        }
        else {
            return this.content;
        }
    }
});

Object.defineProperty(String.prototype, "decodeHTML", {
    value: function () {
        return decodeHTML(this).replace(/<br>/gi, "\n");
    }
});

Object.defineProperty(String.prototype, "hashCode", {
    value: function () {
        let h = 0;
        for (let i = 0; i < this.length; i++) {
            h = (31 * h + this.codePointAt(i)) | 0; // 연산 후 signed 32-bit 정수로 변환
        }
        return h;
    }
});

Object.defineProperty(Object.prototype, "$i", { // util.inspect의 결과 출력
    value: function (dep = 2) {
        return util.inspect(this, { depth: dep });
    }
});

Object.defineProperty(Object.prototype, "$", { // 객체의 키와 값 출력
    get: function () {
        return Object.getOwnPropertyNames(this).map((v) => {
            try {
                return `${v}: ${this[v]}`;
            }
            catch (e) {
                return `${v}: error`;
            }
        }).join("\n");
    },
    set: function () { }
});

Object.defineProperty(Object.prototype, "$k", { // 객체의 키만 출력
    get: function () {
        return Object.getOwnPropertyNames(this).join("\n");
    }
});

Object.defineProperty(Object.prototype, "$$", { // 상위 프로토타입의 키와 값 출력
    get: function () {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).map((v) => {
            try {
                return `${v}: ${this[v]}`;
            }
            catch (e) {
                return `${v}: error`;
            }
        }).join("\n");
    }
});

Object.defineProperty(Object.prototype, "$$k", { // 상위 프로토타입의 키만 출력
    get: function () {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).join("\n");
    }
});

module.exports = Discord;