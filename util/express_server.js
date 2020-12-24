const { exists, readFile } = require('./async_to_promis.js');
const express = require('express');
const app = express();

app.get('/image/:category/:name', async (req, res) => { // 이미지 경로
    console.log(`익스프레스 접속\n${req.params.$}`); // 라우팅 경로에 해당하는 부분
    if (await exists(`./pictures/${req.params.category}/${req.params.name}`)) {
        res.end(await readFile(`./pictures/${req.params.category}/${req.params.name}`));
    }
    else {
        res.end('Image is not exists.');
    }
});

app.get('/:name', async (req, res) => { // 그 외 경로
    console.log(`익스프레스 접속\n${req.params.$}`); // 라우팅 경로에 해당하는 부분
    if (await exists('./htmls/default.html')) {
        res.end(await readFile('./htmls/default.html'));
    }
});

app.get('/', async (req, res) => { // 메인 화면
    console.log(`익스프레스 접속\n${req.params.$}`); // 라우팅 경로에 해당하는 부분
    if (await exists('./htmls/default.html')) {
        res.end(await readFile('./htmls/default.html'));
    }
});

app.listen(8170, () => {
    console.log("8170번 port에 http server를 띄웠습니다.");
});

module.exports = app;