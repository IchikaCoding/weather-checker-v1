const weatherBtnElement = document.getElementById("weather-btn");

weatherBtnElement.addEventListener("click", main);

// JS：動きを作るところ

// 1. 勉強用のダミーAPI関数（サーバーからデータを取ってくるフリをする）
// main()でオブジェクトを取得するときに使う処理
// API通信する→404だったらエラー投げる
// 成功したらオブジェクトのデータを返す

async function fetchWeather(locationId) {
  try {
    // fetchしてAPI通信してデータ取得する
    // URLはテキストだからlocationIdは文字列のままでOK
    const res = await fetch(
      `https://weather.tsukumijima.net/api/forecast/city/${locationId}`
    );
    if (!res.ok) {
      throw new Error("404エラー！！");
    }
    const dataObj = await res.json();
    console.log(dataObj);
    return dataObj;
  } catch (error) {
    // 上で発生したエラーをそのままmain()のtry / catchにわたす！
    throw error;
  }
}

// 2. メインの処理
async function main() {
  try {
    displayLoading();
    const id = getId();
    if (!isValidNumericInput(id)) {
      alert("有効な数字を入力してください");
      throw new Error("有効な数字を入力してください");
    }
    // console.log(id);
    // 非同期処理だけのところでawaitが必要
    const data = await fetchWeather(id);
    // TODO: ここでdataが取得できていなかった場合の処理を書いておく
    // 同期処理だからawaitは不要！
    renderWeather(data);
  } catch (error) {
    console.error(error);
  }
}

// TODO: 入力が空のときとかNaNのときに無効なことを伝える処理を追加
// TODO: IDがinvalidのときはどこでお知らせする？
function getId() {
  const locationIdElement = document.getElementById("location-id");
  return locationIdElement.value;
  // 空かチェック
  // 数字に変換してNaNかチェック
}

/**
 * 入力された数字が有効かどうかを判定する関数
 * @param {string} id
 * @returns {boolean}
 */
function isValidNumericInput(id) {
  const trimmed = id.trim();
  if (trimmed === "") return false;
  return /^[0-9]+$/.test(trimmed);
}

// TODO: ローディングアニメーション実装
function displayLoading() {
  const container = document.getElementById("weather-container");
  container.innerHTML = "読み込み中..."; // 待ち時間の演出
}

// locationIdとして入力されたインプットを加工する処理
// カンマ区切り→split
// 余計な空白を削除→trim
// function processData(locationStringId) {
//   locationStringId.split(",");
// }

function getThreeDayData(data) {
  const forecastInfoArray = data.forecasts.map((forecast) => {
    const date = forecast.date ?? "なし";
    const dateLabel = forecast.dateLabel ?? "なし";
    const telop = forecast.telop ?? "なし";
    return { date, dateLabel, telop };
  });
  return forecastInfoArray;
}
// forecastInfoArrayから、HTML要素を作成する
// forecastInfoArrayからデータを一つずつ取得
// そのデータをforecastsHtmlにまとめる
// <h2>場所：東京</h2>+forecastsHtmlを返す
// TODO: 東京以外のときはIDから地名を表示する
function makeHtmlElement(forecastInfoArray) {
  // TODO: これをやる前の時点で取得できなかったらエラーになってこの処理が動かない！
  if (forecastInfoArray.length === 0) {
    return `<p>天気予報が取得できませんでした😱</p>`;
  }
  // mapは新しい配列を返す
  // joinは配列の全要素を順に連結した新しい文字列を返す
  const forecastHtml = forecastInfoArray
    .map((forecastInfo) => {
      return `<ul>
          <li>
            日付：${forecastInfo.date}（${forecastInfo.dateLabel}）
          </li>
          <li>天気：${forecastInfo.telop}</li>
        </ul>`;
    })
    .join("");
  return `<h2>場所：東京</h2>${forecastHtml}`;
}

// 表示する関数
// コンテナを用意する
// 取得したデータをもらって、その天気予報のプロパティから一部のデータをコンテナに追加する
// この処理は、mainで非同期で実行する

function renderWeather(data) {
  // console.log(data);
  const container = document.getElementById("weather-container");
  // threeDayData(data)から必要なデータだけ取得する
  const forecastInfoArray = getThreeDayData(data);
  // そのデータを使ってHTMLの要素たちを取得する
  const htmlEl = makeHtmlElement(forecastInfoArray);
  container.innerHTML = htmlEl;
}
