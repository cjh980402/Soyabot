function recommendWork() {
    const worklist = ['메이플스토리', '제로 육성', '현금술', '본캐 275 달성', '유니온 8천 달성', '보스 먹자', '보스 솔플', '여로 일퀘', // 메이플 할 일
        '츄츄 일퀘', '드림브레이커', '스피릿 세이비어', '모라스 일퀘', '에스페라 일퀘', '스타포스', '템펙업', '코펙업', '젬펙업', '마을에서 점프하기',
        '소야봇과 놀기', '시험 공부', '코딩', '과제', '간식 먹기', '전공 공부', '게으름 피우기', '허리 펴기', '손가락 운동', '잠 자기', '밥 먹기', '퇴근', // 실제 할 일
        '운동', '출근', '야근', '다형성을 이용한 객체지향 프로그래밍의 장점 공부하기', '팀플', '유급휴가', '무급노동', '여행', '대학원 가기', '매운 음식 먹기',
        '취업 준비', '멍 때리기', '기지개 켜기', '끝내주게 누워있기'];
    return `할 일은 [${worklist[Math.floor(Math.random() * worklist.length)]}]입니다.`;
}

function recommendFood() {
    const badgelist = ['뱃지 오브 준나', '뱃지 오브 마노', '뱃지 오브 치우', '뱃지 오브 보탄', '뱃지 오브 도나르', '뱃지 오브 프루바', '뱃지 오브 사투르누스']; // 일, 월, 화, 수, 목, 금, 토
    const daybadge = badgelist[new Date().getDay()]; // 오늘에 해당하는 뱃지
    const foodlist = [daybadge, '코어 젬스톤', '재물 획득의 비약', '경험 축적의 비약', '몽환의 벨트', '거대한 공포', '루즈 컨트롤 머신 마크', '마력이 깃든 안대', '골드애플', '메소', // 메이플 아이템
        '익스트림 성장의 비약', '손상된 블랙 하트', '고통의 근원', '창세의 뱃지', '커맨더 포스 이어링', '저주받은 마도서', '경험치 2배 쿠폰', '레드 큐브', '블랙 큐브', '에디셔널 큐브',
        '가츠동', '삼겹살', '치킨', '짜장면', '짬뽕', '탕수육', '부대찌개', '순대국밥', '돼지국밥', '부침개', '파전', '보쌈', '족발', '냉면', '크림 파스타', '라면(진순 X)', '민트초코', // 실제 음식
        '아이스크림', '따뜻한 아이스 아메리카노', '곱창 덮밥', '제육 덮밥', '돈까스', '참치 김밥', '막창', '마라탕', '뼈해장국', '참치마요', '싸이버거', '감자탕', '참치김밥', '우거지 해장국',
        '청국장 찌개', '초밥', '스팸', '스파게티', '토마 호크', '티본 스테이크', '대창', '파인애플 피자', '순두부 찌개', '차돌 된장찌개', '육회', '곰젤리', '햄버거', '간장비빔국수'];
    return `추천 메뉴는 [${foodlist[Math.floor(Math.random() * foodlist.length)]}]입니다.`;
}

function choiceVS(msg) {
    const splitVS = msg.split(/vs/i);
    const afterReplace = [];
    for (let i = 0; i < splitVS.length; i++) {
        splitVS[i] = splitVS[i].trim();
        if (splitVS[i] === '') {
            return '빈 항목이 존재합니다.';
        }
        afterReplace.push(splitVS[i].replace(/[\s`'"~.,;:*+=!?^$@%&{}()<>/|[\]\\-]/g, '').replace('조아', '좋아').replace('시러', '싫어'));
    }
    for (let i = 0, otherInd; i < splitVS.length / 2; i++) {
        otherInd = afterReplace.lastIndexOf(afterReplace[i]);
        if (otherInd !== i && (afterReplace[i] !== '' || splitVS[otherInd] === splitVS[i])) {
            return `"${splitVS[i]}" 항목이 중복입니다.`;
        }
    }
    return splitVS[Math.floor(Math.random() * splitVS.length)];
}

module.exports = function (message) {
    if (message.content === '주사위') {
        return message.channel.send(`주사위 결과: ${Math.floor(Math.random() * 100 + 1)}`);
    } else if (/vs/i.test(message.content) && !/vsc/i.test(message.content)) {
        return message.reply(choiceVS(message.content));
    } else if (message.content.endsWith('확률')) {
        return message.reply(`확률: ${Math.floor(Math.random() * 101)}%`);
    } else if (/뭐하지|ㅁㅎㅈ/i.test(message.content)) {
        return message.reply(recommendWork());
    } else if (/뭐먹지|ㅁㅁㅈ/i.test(message.content)) {
        return message.reply(recommendFood());
    } else if (message.content.includes(client.user.username)) {
        if (/바\s*보|멍\s*청\s*이/.test(message.content)) {
            return message.channel.send('🤔');
        }
        const cmd = Math.floor(Math.random() * 5);
        if (cmd === 0) {
            return message.channel.send('ㅋㅋㅋ');
        } else if (cmd === 1) {
            return message.channel.send('제로조아');
        } else if (cmd === 2) {
            return message.channel.send('헤비...');
        } else if (cmd === 3) {
            return message.channel.send('이노시스 조아');
        } else {
            return message.channel.send(`'${message.member?.nickname ?? message.author.username}'님이 ${client.user.username}을 불렀습니다.`);
        }
    } else if (message.content.includes('ㅊㅊㅊㅊ')) {
        const cmd = Math.floor(Math.random() * 3);
        if (cmd === 0) {
            return message.channel.send('👍');
        }
    }
};
