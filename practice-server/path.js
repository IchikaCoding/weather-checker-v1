const path = require("path");

const myPath = "practice-server/app.js";

// TODO: ファイルのパスの情報はどこで使うの？
const pathInfo = {
  // ファイルの名前
  fileName: path.basename(myPath),
  //   ファイルがあるところまでのフォルダーの名前
  folderName: path.dirname(myPath),
  //   ファイルの拡張子
  fileExtension: path.extname(myPath),
  //   絶対パスかそうじゃないか
  absoluteOrNot: path.isAbsolute(myPath),
  //   ファイルの詳細情報が一気に取得可能
  detailInfo: path.parse(myPath),
};

console.log(pathInfo);
console.log(path.sep);

// TODO: path.resolveはどこで使うの？
// 現在作業しているディレクトリのパスに、practiceとichikaが追加される
// パスセパレータは使用しているOSのものが使われる
console.log(path.resolve("practice", "ichika"));
