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
var MongoClient = require('mongodb').MongoClient;

// // 데이터베이스 객체를 위한 변수 선언
var database;

// 데이터베이스에 연결
function connectDB() {
    //데이터베이스 연결 정보
    var databaseUrl = 'mongodb://localhost:27017/local';
    //데이터베이스 연결=>실패시 console.log
    // MongoClient.connect(databaseUrl, function (err, db) {
    //     if (err) {
    //         console.log('데이터베이스 연결 실패');
    //         throw err;
    //     }
    //     else {
    //         console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);
    //         // database 변수에 할당
    //         database = db.db('local'); // mongodb>=3.0
    //     }
    // });
    MongoClient.connect(databaseUrl)
        .then(db => {
            console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);
            //database 변수에 할당
            database = db.db('local'); // mongodb>=3.0
        })
        .catch(err => {
            console.log('데이터베이스 연결 실패');
            throw err;
        })
}

//====== 라우터 함수 등록 ======//

// 라우터 객체 참조
var router = express.Router();

// search 요청 처리
router.route('/process/search').post(function (req, res) {
    var newFilePath = path.join(__dirname, 'public', 'search.html');
    
    console.log("Search route called");
    var paramName = req.body.name || req.query.name;
    var paramContext = req.body.context || req.query.context;
    if (database){
        searchMeme(database, paramName, paramContext, (err, result) => {
            if (err) { throw err };

            if (result) {
                console.log(result);

                // 조회 결과에서 사용자 이름 확인
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                res.write('<h1>등록 성공</h1>');
                res.write("<br><br><a href='/public/index.html'>메인으로 돌아가기</a>");
                res.end();
            }
            else {
                // 조회된 레코드가 없는 경우 실패 응답 전송
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                res.write('<h1>검색 실패</h1');
                res.write('<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>');
                res.write("<br><br><a href='/public/index.html'>메인으로 돌아가기</a>");
                res.end();
            }
        });
    }
    res.sendFile(newFilePath, function (err) {
        if (err) {
            console.log('파일전송중 에러 : ', err);
        }
    });
});

// append 요청 처리
router.route('/process/append').post(function (req, res) {
    var newFilePath = path.join(__dirname, 'public', 'append.html');
    var paramName = req.body.name || req.query.name;
    var paramContext = req.body.context || req.query.context;
    console.log("Append route called");
    if (database) {
        addContent(database, paramName, paramContext, (err, result) => {
            if (err) { throw err };

            if (result) {
                console.log(result);

                // 조회 결과에서 사용자 이름 확인
                res.sendFile(newFilePath, function (err) {
                    if (err) {
                        console.log('파일전송중 에러 : ', err);
                    }
                });
            }
            else {
                // 조회된 레코드가 없는 경우 실패 응답 전송
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                res.write('<h1>검색 실패</h1');
                res.write('<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>');
                res.write("<br><br><a href='/public/index.html'>메인으로 돌아가기</a>");
                res.end();
            }
        });
    }

});

router.route('/process/add').post(function (req, res) {

    var paramName = req.body.name || req.query.name;
    var paramContext = req.body.context || req.query.context;

    console.log('요청파라미터 : ' + paramName + ' ,' + paramContext);

    if (database) {

        addContent(database, paramName, paramContext, (err, result) => {
            if (err) { throw err };

            if (result) {
                console.log(result);

                // 조회 결과에서 사용자 이름 확인
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                res.write('<h1>등록 성공</h1>');
                res.write("<br><br><a href='/public/index.html'>메인으로 돌아가기</a>");
                res.end();
            }
            else {
                // 조회된 레코드가 없는 경우 실패 응답 전송
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                res.write('<h1>등록 실패</h1');
                res.write('<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>');
                res.write("<br><br><a href='/public/index.html'>다시로그인하기</a>");
                res.end();
            }
        });
    } else {
        // 데이터베이스 객체가 초기화 되지 않은 경우 실패 응답 전송
        res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
        res.end();
    }
});

// 라우터 객체 등록
app.use('/', router);

var addContent = function (database, name, context, callback) {
    console.log('addcontent 호출됨 : ' + name + ', ' + context);

    // user 컬렉션
    var memes = database.collection('memes');
    // 아이디와 비밀번호를 이용해 검색
    memes.find(
        {
            "name": name
        }).toArray(function (err, docs) {
            if (err) {
                // 에러 발생시 콜백 함수를 호출하면서 에러 객체 전달
                callback(err, null);
                return;
            }
            if (docs.length > 0) {
                // 조회한 레코드가 있는 경우 콜백함수를 호출하면서 조회 결과 전달
                console.log('아이디 [%s] 일치하는 밈 찾음.', name);
                callback(null, docs);
            } else {
                // 조회한 레코드가 없는 경우 콜백 함수를 호출하면서 null,null 전달
                console.log('일치하는 밈 찾지 못함');
                callback(null, null);
            }
        });
};


var searchMeme = function (database, name, context, callback) {
    console.log('searchMeme 호출됨 : ' + name + ', ' + context);

    // user 컬렉션
    var memes = database.collection('meme');
    // 아이디와 비밀번호를 이용해 검색
    memes.find(
        {
            "name": name
        }).toArray(function (err, docs) {
            if (err) {
                // 에러 발생시 콜백 함수를 호출하면서 에러 객체 전달
                callback(err, null);
                return;
            }
            if (docs.length > 0) {
                // 조회한 레코드가 있는 경우 콜백함수를 호출하면서 조회 결과 전달
                console.log('이름 [%s] 일치하는 밈 찾음.', name);
                callback(null, docs);
            } else {
                // 조회한 레코드가 없는 경우 콜백 함수를 호출하면서 null,null 전달
                console.log('일치하는 밈 찾지 못함');
                callback(null, null);
            }
        });
}

var addContent = function (database, name, context, callback) {
    console.log("addcontent호출됨");

    var memes = database.collection('memes');

    memes.insertMany([{ "name": name, "context": context }], function (err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        if (result.insertedCount > 0) {
            console.log("밈 추가됨 : " + result.insertedCount)
        }
        else {
            console.log("추가된 레코드 없음");
        }
        callback(null, result);
    });
}
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
    connectDB();
});
