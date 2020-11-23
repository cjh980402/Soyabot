const { MessageAttachment } = require("discord.js");
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = {
    usage: `${client.prefix}날씨 (지역)`,
    command: ["날씨", "ㄴㅆ"],
    description: `- 입력한 지역의 날씨를 알려줍니다.
- 참고. ${client.prefix}날씨 목록`,
    browser: true,
    type: ["기타"],
    async execute(message, args) {
        if (!args[0]) {
            args[0] = '서울';
        }
        else if (args[0] == '목록' || args[0] == 'ㅁㄹ') {
            return message.channel.send(`<지원하는 지역>${"\u200b".repeat(500)}\n가평, 강릉, 강진, 강화, 거제, 거창, 경산, 경주, 계룡, 고령, 고산, 고성, 고성, 고양, 고창, 고흥, 곡성, 공주, 과천, 광명, 광양, 광주, 광주, 괴산, 구례, 구리, 구미, 군산, 군위, 군포, 금산, 김제, 김천, 김포, 김해, 나주, 남양주, 남원, 남해, 논산, 단양, 달성, 담양, 당진, 대관령, 대구, 대전, 독도, 동두천, 동해, 목포, 무안, 무주, 문경, 밀양, 백령도, 보령, 보성, 보은, 봉화, 부산, 부안, 부여, 부천, 사천, 산청, 삼척, 상주, 서귀포, 서산, 서울, 서천, 성남, 성산포, 성주, 성판악, 세종, 속초, 수원, 순창, 순천, 시흥, 신안, 아산, 안동, 안산, 안성, 안양, 양구, 양산, 양양, 양주, 양평, 여수, 여주, 연천, 영광, 영덕, 영동, 영암, 영양, 영월, 영주, 영천, 예산, 예천, 오산, 옥천, 완도, 완주, 용인, 울릉도, 울산, 울진, 원주, 음성, 의령, 의성, 의왕, 의정부, 이천, 익산, 인제, 인천, 임실, 장성, 장수, 장흥, 전주, 정선, 정읍, 제주, 제천, 증평, 진도, 진안, 진주, 진천, 창녕, 창원, 천안, 철원, 청도, 청송, 청양, 청주, 추풍령, 춘천, 충주, 칠곡, 태백, 태안, 통영, 파주, 평창, 평택, 포천, 포항, 하남, 하동, 함안, 함양, 함평, 합천, 해남, 홍성, 홍천, 화성, 화순, 화천, 횡성, 흑산도`);
        }
        const parse = cheerio.load(await (await fetch("https://www.weatheri.co.kr/forecast/forecast01.php?mNum=1&sNum=1")).text());
        const linkdata = parse('table[cellpadding="3"]');
        let targetURL = "https://www.weatheri.co.kr/forecast/";
        for (let i = 0; i < linkdata.length; i++) {
            const list = linkdata.eq(i).find('a[href]');
            for (let j = 0; j < list.length; j++) {
                if (list.eq(j).text() == args[0]) {
                    targetURL += list.eq(j).attr('href');
                }
            }
        }
        if (targetURL == "https://www.weatheri.co.kr/forecast/") {
            return message.channel.send("지원하지 않는 지역입니다.");
        }

        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

        const page = await browser.newPage();
        page.setViewport({ width: 1400, height: 1000 }); // 넓은 화면 세팅
        try {
            await page.goto(targetURL);
            const attachment = new MessageAttachment(await (await page.$('body > table:nth-child(4) > tbody > tr:nth-child(3) > td:nth-child(2) > table > tbody > tr:nth-child(3)')).screenshot(), 'weather.png');
            return message.channel.send(`${args[0]}의 날씨`, {
                files: [attachment]
            });
        }
        catch (e) {
            console.log('에러발생');
            return message.channel.send(`${args[0]} 지역 정보를 가져오지 못하였습니다.`);
        }
        finally {
            await browser.close();
        }
    }
};
