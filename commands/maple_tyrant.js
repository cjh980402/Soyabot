module.exports = {
    name: "타일런트",
    aliases: ["ㅌㅇㄹㅌ", "ㅌㅇㄾ"],
    description: "타일런트 장비의 스타포스 강화 능력치 출력",
    type: ["메이플"],
    execute(message) {
        message.channel.send('타일런트 스타포스 강화 능력치 표', {
            files: ['./pictures/tyrant.png']
        });
    }
};