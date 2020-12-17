const proper = {
    '[원더블랙] 랑월': 332,
    '[원더블랙] 하랑': 332,
    '[원더블랙] 은하': 332,
    '크앙여우': 1200,
    '삐약멍': 1200,
    '멍뭉덕': 1200,
    '오데트 삐삐': 1200,
    '뚠호': 1200,
    '고농축 프리미엄 생명의 물': 1502,
    '오가닉 원더 쿠키': 1502
}

module.exports = {
    usage: `${client.prefix}원더베리 (횟수)`,
    command: ["원더베리", "ㅇㄷㅂㄹ", "원기베리", "ㅇㄱㅂㄹ"],
    description: `- 1 ~ 20000 범위의 횟수를 입력하면 그만큼의 원더베리 시뮬을 수행합니다.\n- 참고. ${client.prefix}원더베리 확률`,
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        if (args[0] == '확률' || args[0] == 'ㅎㄹ') {
            let rslt = '<원더베리 확률>';
            for (let key in proper) {
                rslt += `\n${key}: ${proper[key] / 100}%`;
            }
            return message.channel.send(rslt);
        }
        if (isNaN(args[0]) || +args[0] < 1 || +args[0] > 20000) {
            return message.channel.send('1 ~ 20000 범위의 숫자만 입력가능합니다.');
        }

        // args[0]은 원더베리 횟수
        // random은 0이상 1미만
        const list = {}; // 횟수 담을 객체
        let propsum = 0; // 확률표의 확률값의 합
        for (let key in proper) {
            list[key] = 0;
            propsum += proper[key];
        }
        for (let i = 0; i < +args[0]; i++) {
            const now = Math.floor(Math.random() * propsum + 1);
            let sum = 0;
            for (let key in proper) {
                sum += proper[key];
                if (now <= sum) {
                    list[key]++;
                    break;
                }
            }
        }

        let rslt = `원더베리 ${args[0]}회 결과\n`;
        for (let key in list) {
            if (list[key] != 0) {
                rslt += `\n${key}: ${list[key]}회`;
            }
        }
        return message.channel.send(rslt);
    }
};