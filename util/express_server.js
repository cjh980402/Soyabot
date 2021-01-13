const { exists, readFile } = require('./async_to_promis.js');
const express = require('express');
const app = express();

const server = app.listen(8170, () => {
    console.log(`${server.address().port}번 port에 http server를 띄웠습니다.`);
});

app.get('/image/:category/:picName', async (req, res) => { // 이미지 경로
    try {
        console.log(`익스프레스 접속 경로\n${decodeURIComponent(req.path)}`); // request의 원본 경로
        console.log(`익스프레스 하위 속성\n${req.params.$}\n${req.query.$}`); // 라우팅 하위 경로와 쿼리에 해당하는 부분
        if (await exists(`./pictures/${req.params.category}/${req.params.picName}`)) {
            res.end(await readFile(`./pictures/${req.params.category}/${req.params.picName}`));
        }
        else {
            res.end('Image is not exists.');
        }
    }
    catch (e) {
        res.end('400 Bad Request');
    }
});

app.get('/:name', async (req, res) => { // 그 외 경로
    try {
        console.log(`익스프레스 접속 경로\n${decodeURIComponent(req.path)}`); // request의 원본 경로
        console.log(`익스프레스 하위 속성\n${req.params.$}\n${req.query.$}`); // 라우팅 하위 경로와 쿼리에 해당하는 부분
        if (await exists('./htmls/default.html')) {
            res.end(await readFile('./htmls/default.html'));
        }
        else {
            res.end('Data is not exists.');
        }
    }
    catch (e) {
        res.end('400 Bad Request');
    }
});

app.get('/', async (req, res) => { // 메인 화면
    try {
        console.log(`익스프레스 접속 경로\n${decodeURIComponent(req.path)}`); // request의 원본 경로
        console.log(`익스프레스 하위 속성\n${req.params.$}\n${req.query.$}`); // 라우팅 하위 경로와 쿼리에 해당하는 부분
        if (await exists('./htmls/default.html')) {
            res.end(await readFile('./htmls/default.html'));
        }
        else {
            res.end('Main of Soyabot');
        }
    }
    catch (e) {
        res.end('400 Bad Request');
    }
});

module.exports = server;