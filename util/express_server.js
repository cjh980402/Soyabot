const { readFile } = require('fs').promises;
const express = require('express');
const app = express();
const myPort = 8170;
app.locals.port = myPort;

function getServerHTML(redirectURL) {
    const script = ['window.location.href = "kakaotalk://inappbrowser/close";', 'window.location.href = "kakaoweb://closeBrowser";', 'window.close();'];
    if (redirectURL) {
        script.push(`window.location.href = "${redirectURL}";`);
    }
    return `<script>\n${script.join('\n')}\n</script>`;
}

app.listen(myPort, () => {
    console.log(`${myPort}번 port에 http server를 띄웠습니다.`);
});

app.get('/image/:category/:picName', async (req, res) => {
    // 이미지 호스팅 경로
    try {
        console.log(`익스프레스 접속 경로\n${decodeURIComponent(req.originalUrl)}`); // request의 원본 경로
        console.log(`익스프레스 하위 속성\n${req.params._p}\n${req.query._p}`); // 라우팅 하위 경로와 쿼리에 해당하는 부분
        res.end(await readFile(`./pictures/${req.params.category}/${req.params.picName}`));
    } catch {
        res.end('400 Bad Request');
    }
});

app.get('/:name', (req, res) => {
    // 그 외 경로
    try {
        console.log(`익스프레스 접속 경로\n${decodeURIComponent(req.originalUrl)}`); // request의 원본 경로
        console.log(`익스프레스 하위 속성\n${req.params._p}\n${req.query._p}`); // 라우팅 하위 경로와 쿼리에 해당하는 부분
        res.end(getServerHTML());
    } catch {
        res.end('400 Bad Request');
    }
});

app.get('/', (req, res) => {
    // 메인 화면
    try {
        console.log(`익스프레스 접속 경로\n${decodeURIComponent(req.originalUrl)}`); // request의 원본 경로
        console.log(`익스프레스 하위 속성\n${req.params._p}\n${req.query._p}`); // 라우팅 하위 경로와 쿼리에 해당하는 부분
        res.end(getServerHTML());
    } catch {
        res.end('400 Bad Request');
    }
});

module.exports = app;
