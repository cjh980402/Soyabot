module.exports = {
    name: "어빌리티",
    aliases: ["ㅇㅂㄹㅌ", "ㅇㅂㄾ"],
    description: "레어 ~ 레전드리 어빌리티의 능력치 출력",
    type: ["메이플"],
    execute(message) {
        message.channel.send('어빌리티 능력치 표', {
            files: ['./pictures/ability.png']
        });
    }
};