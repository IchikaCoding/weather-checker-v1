// Node.jsのモジュールを組み込む作業
// インポート的なもの
// TODO:　requireとは？
// 組み込みモジュールだからすぐ使えるよ
// HTTPサーバーを作成するためのモジュール
var http = require("http");
// ファイルの読み書きをするためのモジュール
var fs = require("fs");
// ファイルパスの操作のための機能の提供しているモジュール
var path = require("path");

// http.createServerはサーバーオブジェクトを返している
//  →これを利用すると「起動・停止・監視」
// 今回はポート8125でその場で起動もしている
// 変数に受け取っていないから、停止とか監視はできない
http
  .createServer(function (request, response) {
    // createServerは「アクセスが来たら実行する関数」を渡す
    // request ＝「お客さんから届いた情報」
    // response ＝「お客さんへ返すための箱（返事）」

    console.log("request ", request.url);
    // request.url には「どのURLにアクセスされたか」が入る
    // 例: / や /index.html や /style.css など

    var filePath = "." + request.url;
    // 実際のファイルの場所に変換する
    // 例: request.url が /index.html なら "./index.html" になる

    if (filePath == "./") {
      filePath = "./index.html";
      // もし / だけ来たら、トップページとして index.html を返す
    }

    var extname = String(path.extname(filePath)).toLowerCase();
    // path.extnameでファイルの拡張子を取り出す
    // 例: "./style.css" → ".css"

    var mimeTypes = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".wav": "audio/wav",
      ".mp4": "video/mp4",
      ".woff": "application/font-woff",
      ".ttf": "application/font-ttf",
      ".eot": "application/vnd.ms-fontobject",
      ".otf": "application/font-otf",
      ".wasm": "application/wasm",
    };
    // 拡張子ごとに「どんな種類のファイルか」を決める表
    // これがないと、ブラウザが正しく表示できないことがある

    // ? もしmimeTypes[extname]がnullかundefined、空文字だったら"application/octet-stream"にする
    var contentType = mimeTypes[extname] || "application/octet-stream";
    // もし知らない拡張子なら「とりあえずバイナリ(不明なファイル)」扱いにする

    // TODO:　コールバックには読み込む方法を指定している？
    fs.readFile(filePath, function (error, content) {
      // filePathのファイルを読み込む（非同期）
      // error があれば読み込み失敗、content に中身が入る

      if (error) {
        if (error.code == "ENOENT") {
          // ENOENTは「ファイルが見つからない」
          fs.readFile("./404.html", function (error, content) {
            // 404専用ページを返す
            // TODO:　writeHeadはなに？
            // リクエストに対してレスポンスヘッダーを返すため
            // HTTP ステータスコードが入る
            response.writeHead(404, { "Content-Type": "text/html" });
            response.end(content, "utf-8");
          });
        } else {
          // それ以外のエラーは 500（サーバー側エラー）
          response.writeHead(500);
          response.end(
            "Sorry, check with the site admin for error: " +
              error.code +
              " ..\n",
          );
        }
      } else {
        // ファイルが読めたら、その内容を返す
        response.writeHead(200, { "Content-Type": contentType });
        response.end(content, "utf-8");
      }
    });
  })
  .listen(8125);
// 8125番ポートで待ち受ける（この番号にアクセスすると動く）

console.log("Server running at http://127.0.0.1:8125/");
// 起動したことを表示するだけ
