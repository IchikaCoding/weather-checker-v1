const weatherBtnElement = document.getElementById("weather-btn");

weatherBtnElement.addEventListener("click", main);

// JS：動きを作るところ

// 1. 勉強用のダミーAPI関数（サーバーからデータを取ってくるフリをする）
// main()でオブジェクトを取得するときに使う処理
// API通信する→404だったらエラー投げる
// 成功したらオブジェクトのデータを返す

async function fetchWeather(locationId) {
  // fetchしてAPI通信してデータ取得する
  // URLはテキストだからlocationIdは文字列のままでOK
  const res = await fetch(
    `https://weather.tsukumijima.net/api/forecast/city/${locationId}`,
  );
  if (!res.ok) {
    throw new Error("API通信エラー！！");
  }
  const dataObj = await res.json();
  console.log(dataObj);
  return dataObj;
}

// 2. メインの処理
async function main() {
  try {
    displayLoading();
    const id = getId();
    const trimmed = trimId(id);
    //  id が取得できなかったときの処理を追加
    if (!isValidNumericInput(trimmed)) {
      alert("有効な数字を入力してください");
      throw new Error("有効な数字を入力してください");
    }
    const isSixDigits = (id) => {
      if (id.length === 6) {
        return true;
      }
      return false;
    };

    if (!isSixDigits(trimmed)) {
      throw new Error("無効なIDです！");
    }
    // console.log(id);
    // 非同期処理だけのところでawaitが必要
    //  checkDataはdataが取得できていなかった場合の処理
    const data = checkData(await fetchWeather(trimmed));
    calculateChanceOfRain(data);

    // 同期処理だからawaitは不要！
    renderWeather(data);
  } catch (error) {
    console.error(error);
    displayError(error);
  }
}
// TODO: これをやる前の時点で取得できなかったらエラーになってこの処理が動かない！
function displayError(error) {
  const container = document.getElementById("weather-container");
  container.innerHTML = `<h2>天気予報が取得できませんでした😱</h2><p>${error.message}</p>`;
}

// 失敗したときの説明と中断の処理が必要
// fetchでの失敗は何があるか？
// エラーを返す処理を書きたい
function checkData(data) {
  console.log("checkData動いた🐣");
  if (data === null || data === undefined) {
    throw new Error("データが取得できませんでした");
  }
  return data;
}

function getId() {
  const locationIdElement = document.getElementById("location-id");
  return locationIdElement.value;
  // 空かチェック
  // 数字に変換してNaNかチェック
}

/**
 * TODO:　空白削除などの処理したidはisSixDigitsで使用したい！
 * 値を返してほしい！
 * 入力された数字が有効かどうかを判定する関数
 * @param {string} id
 * @returns {boolean}
 */
function isValidNumericInput(id) {
  console.log("isValidNumericInput実行⭐");
  // const trimmed = id.trim();
  if (id === "") return false;
  return /^[0-9]+$/.test(id);
}

function trimId(id) {
  const trimmed = id.trim();
  return trimmed;
}

// 6桁かどうかをチェックする関数
// function isSixDigits(id) {
//   if (id.length === 6) {
//     return true;
//   }
//   return false;
// }
// TODO: これ消す
const isSixDigits = (id) => {
  if (id.length === 6) {
    return true;
  }
  return false;
};

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
/**
 * TODO: JSDocを書き換える
 * @param {object} data
 * @returns {{city: string, forecastInfoArray: Array}}
 */
function getThreeDayData(data) {
  const forecastInfoArray = data.forecasts.map((forecast) => {
    const date = forecast.date ?? "なし";
    const dateLabel = forecast.dateLabel ?? "なし";
    const telop = forecast.telop ?? "なし";
    return { date, dateLabel, telop };
  });
  const city = data.location?.city ?? "なし";
  console.log({ city, forecastInfoArray });
  // 返すときはオブジェクトの省略記法となり、受け取るときなら分割代入！
  return { city, forecastInfoArray };
}
// forecastInfoArrayから、HTML要素を作成する
// forecastInfoArrayからデータを一つずつ取得
// そのデータをforecastsHtmlにまとめる
// <h2>場所：東京</h2>+forecastsHtmlを返す

function makeHtmlElement(dataObj) {
  // // TODO: これをやる前の時点で取得できなかったらエラーになってこの処理が動かない！
  // if (dataObj.forecastInfoArray.length === 0) {
  //   return `<p>天気予報が取得できませんでした😱</p>`;
  // }
  // mapは新しい配列を返す
  // joinは配列の全要素を順に連結した新しい文字列を返す
  const forecastHtml = dataObj.forecastInfoArray
    .map((forecastInfo) => {
      return `<ul>
          <li>
            日付：${forecastInfo.date}（${forecastInfo.dateLabel}）
          </li>
          <li>天気：${forecastInfo.telop}</li>
        </ul>`;
    })
    .join("");
  return `<h2>場所：${dataObj.city}</h2>${forecastHtml}`;
}

// 表示する関数
// コンテナを用意する
// 取得したデータをもらって、その天気予報のプロパティから一部のデータをコンテナに追加する
// この処理は、mainで非同期で実行する

function renderWeather(data) {
  // console.log(data);
  const container = document.getElementById("weather-container");
  // threeDayData(data)から必要なデータだけ取得する
  const forecastInfoObj = getThreeDayData(data);
  // そのデータを使ってHTMLの要素たちを取得する
  const htmlEl = makeHtmlElement(forecastInfoObj);
  container.innerHTML = htmlEl;
}

// TODO: 各日の chanceOfRain を取り出す
function calculateChanceOfRain(data) {
  const chanceOfRain = data.forecasts[0].chanceOfRain;
  console.log(chanceOfRain);
}
