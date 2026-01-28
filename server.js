const express = require("express"); // Expressという「サーバーを簡単に作る道具」を読み込む
// appという関数を作成している？
// → express()を呼ぶと「サーバーの本体」を作れる
const app = express();

// expressの中にあるgetメソッドを使用している？
// → 「ブラウザが / にアクセスしたときのルール」を決めている
// / は「トップページ」を意味する
app.get("/", (req, res) => {
  // TODO: リクエスト送ると返答がHello Express!？ってこと
  // → そう。ブラウザで http://localhost:3000/ を開くと
  //    "Hello Express!" という文字を返す
  res.send("Hello Express!");
});

const PORT = 3000; // サーバーを開く番号（ポート番号）
// TODO: expressのサーバーを開くポートを指定している？
// → そう。この番号で待ち受ける
app.listen(PORT, () => {
  // サーバーが起動したらコンソールに表示する
  console.log(`Server running at http://localhost:${PORT}`);
});
