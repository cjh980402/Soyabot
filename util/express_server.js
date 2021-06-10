const { readFile } = require('fs').promises;
const { cmd } = require('../admin/admin_function');
const { AES } = require('./crypto');
const express = require('express');
const app = express();
app.locals.port = 8170;
app.locals.restartPath = encodeURIComponent(String(AES.encrypt('restart', Math.random().toString(36))));

function getServerHTML(redirectURL) {
    const script = ['window.location.href = "kakaotalk://inappbrowser/close";', 'window.location.href = "kakaoweb://closeBrowser";', 'window.close();'];
    if (redirectURL) {
        script.push(`window.location.href = "${redirectURL}";`);
    }
    return `<script>\n${script.join('\n')}\n</script>`;
}

app.listen(app.locals.port, () => {
    console.log(`${app.locals.port}번 port에 http server를 띄웠습니다.`);
});

app.get('/restart/:path', async (req, res) => {
    // 봇 재가동 경로
    try {
        console.log(`익스프레스 접속 경로\n${decodeURIComponent(req.originalUrl)}`); // request의 원본 경로
        console.log(`익스프레스 하위 속성\n${req.params._p}\n${req.query._p}`); // 라우팅 하위 경로와 쿼리에 해당하는 부분
        res.end(getServerHTML());
        if (req.originalUrl.substr(9) === app.locals.restartPath) {
            // 해당하는 경로 접속 시 재가동
            console.log('봇 재가동');
            await cmd('npm restart');
        }
    } catch {
        res.end('400 Bad Request');
    }
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
