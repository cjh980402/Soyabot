module.exports = {
    usage: `${client.prefix}입대 YYMMDD`,
    command: ["입대", "ㅇㄷ"],
    description: "- 입력한 입대일을 기준으로 전역일을 계산해줍니다. (육군 기준)",
    type: ["기타"],
    async execute(message, args) {
        if (args.length != 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const date = args[0].match(/^(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/);
        // 올바른 YYMMDD 형식인지 확인하는 정규식 -> 인덱스 1: 연도, 2: 월, 3: 일
        if (!date) {
            return message.channel.send("잘못된 형식의 날짜를 입력하였습니다. YYMMDD 형식으로 입대일을 입력해주세요.");
        }

        const [year, mon, day] = [+date[1] + 2000, +date[2], +date[3]];
        const stdday = new Date(2017, 1 - 1, 3); // 2017.01.03부터 2주마다 1일씩 단축
        const after18 = new Date(2020, 6 - 1, 16); // 2020.06.16부터 18개월 복무
        const start = new Date(year, mon - 1, day);
        const before = new Date(year + 2, mon - 1 - 3, day - 1); //단축 전 전역일
        if (start < stdday) { // 21개월 복무
            return message.channel.send(`입대일: ${year}.${mon}.${day}\n`
                + `전역일: ${before.getFullYear()}. ${before.getMonth() + 1}. ${before.getDate()}.\n`
                + `전체 복무일: ${(before - start) / 86400000}일`);
        }
        else {
            const minusday = Math.floor((start - stdday) / (86400000 * 14) + 1); // 단축일 수 계산
            const after = (start >= after18) ? new Date(year + 2, mon - 1 - 6, day - 1) : (new Date(before - minusday * 86400000)); // 전자는 18개월 복무
            return message.channel.send(`입대일: ${year}. ${mon}. ${day}.\n`
                + `단축 전 전역일: ${before.getFullYear()}. ${before.getMonth() + 1}. ${before.getDate()}.\n`
                + ((start >= after18) ? `복무기간이 18개월입니다.\n` : `단축일 수: ${minusday}일\n`)
                + `단축 후 전역일: ${after.getFullYear()}. ${after.getMonth() + 1}. ${after.getDate()}.\n`
                + `전체 복무일: ${(after - start) / 86400000}일`
                + ((new Date() > after) ? '' : `\n현재 복무율: ${((new Date() < start ? 0 : (new Date() - start)) / (after - start) * 100).toFixed(2)}%\n`
                    + `전역까지 ${Math.ceil((after - new Date()) / 86400000)}일 남았습니다.`));
        }
    }
};