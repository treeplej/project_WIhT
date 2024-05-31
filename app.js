// Express 기본 모듈
var express = require('express')
    , http = require('http')
    , path = require('path');

// Express 미들웨어
var bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , static = require('serve-static')
    , errorHandler = require('errorhandler');

// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require('express-session');

// 익스프레스 객체 생성
var app = express();

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }));

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json());

// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));

//====== 데이터 베이스 연결 ======//
// 몽고DB 모듈 사용
// var MongoClient = require('mongodb').MongoClient;

// // 데이터베이스 객체를 위한 변수 선언
// var database;

// 데이터베이스에 연결
// function connectDB() {
//     //데이터베이스 연결 정보
//     var databaseUrl = 'mongodb://localhost:27017/local';
//     //데이터베이스 연결=>실패시 console.log
//     // MongoClient.connect(databaseUrl, function (err, db) {
//     //     if (err) {
//     //         console.log('데이터베이스 연결 실패');
//     //         throw err;
//     //     }
//     //     else {
//     //         console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);
//     //         // database 변수에 할당
//     //         database = db.db('local'); // mongodb>=3.0
//     //     }
//     // });
//     MongoClient.connect(databaseUrl)
//         .then(db => {
//             console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);
//             //database 변수에 할당
//             database = db.db('local'); // mongodb>=3.0
//         })
//         .catch(err => {
//             console.log('데이터베이스 연결 실패');
//             throw err;
//         })
// }

//====== 라우터 함수 등록 ======//

// 라우터 객체 참조
var router = express.Router();

// search 요청 처리
router.route('/process/search').post(function (req, res) {
    var newFilePath = path.join(__dirname, 'public', 'search.html');
    console.log("Search route called");
    res.sendFile(newFilePath, function (err) {
        if (err) {
            console.log('파일전송중 에러 : ', err);
        }
    });
});

// append 요청 처리
router.route('/process/append').post(function (req, res) {
    var newFilePath = path.join(__dirname, 'public', 'append.html');
    console.log("Append route called");
    res.sendFile(newFilePath, function (err) {
        if (err) {
            console.log('파일전송중 에러 : ', err);
        }
    });
});

// 라우터 객체 등록
app.use('/', router);

// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// Express 서버 시작
http.createServer(app).listen(app.get('port'), function () {
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

    // 데이터 베이스 연결을 위한 함수 호출
    //connectDB();
});
