const express = require("express");
// appという関数を作成している？
const app = express();

// expressの中にあるgetメソッドを使用している？
//
app.get("/", (req, res) => {
  //TODO:   リクエスト送ると返答がHello Express!？ってこと
  res.send("Hello Express!");
});

const PORT = 3000;
// TODO: expressのサーバーを開くポートを指定している？
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
