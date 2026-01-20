const weatherBtnElement = document.getElementById("weather-btn");
const locationIdElement = document.getElementById("location-id");
weatherBtnElement.addEventListener("click", main);

// JS：動きを作るところ

// 1. 勉強用のダミーAPI関数（サーバーからデータを取ってくるフリをする）
async function fetchWeather(locationId) {
  // TODO:　fetchしてAPI通信してデータ取得する処理を書く
  const data = await fetch(
    `https://weather.tsukumijima.net/api/forecast/city/${locationIdElement}`,
  );
  //   TODO: JSのオブジェクトにしてから返す
  // 0.5秒後にresolve実行（0.5秒待つ処理）
  await new Promise((resolve) => setTimeout(resolve, 500));

  // IDによってデータを変える工夫（ごっこ遊び）
  //
  let name = "不明な場所";
  if (locationId === "130010") name = "東京";
  if (locationId === "270000") name = "大阪";

  // livedoor互換っぽいデータを返す
  return {
    locationId: locationId,
    locationName: name,
    forecasts: [
      { date: "明日", telop: "晴れ", max: 24, min: 14 },
      { date: "明後日", telop: "くもり", max: 22, min: 13 },
      { date: "明々後日", telop: "雨", max: 19, min: 12 },
    ],
  };
}

// 2. メインの処理
async function main() {
  const container = document.getElementById("weather-container");
  container.innerHTML = "読み込み中..."; // 待ち時間の演出
  // TODO: たぶん、インプットする場所を作成してその値を取得してこればOK?
  //  TODO 取得したデータは配列で管理する予定？
  // 複数の場所ID（配列）
  const locationIds = ["130010", "270000"];

  // 結果を貯めるための変数を初期化
  let htmlContent = "";

  // ★勉強ポイント1：配列を for...of で回す（非同期を中で使う）
  // 「リストにある場所を、ひとつずつ順番に処理するよ」
  for (const id of locationIds) {
    // ★勉強ポイント2：非同期処理 (await)
    // 「データが届くまで、ここで一旦ストップして待つよ」
    const data = await fetchWeather(id);

    // ここから画面を作るためのHTMLを組み立てる
    htmlContent += `<div class="weather-card">`;
    htmlContent += `<div class="location-title">場所: ${data.locationName}</div>`;

    // --- Object.entries の練習エリア ---

    const info = {
      ID: data.locationId,
      //   forecasts配列のオブジェクトの数を数えたら日数がわかる
      予報日数: data.forecasts.length + "日分",
      //   TODO:　取得できなかった場合はcatchで例外？
      ステータス: "取得成功",
    };

    htmlContent += `<div class="info-list"><strong>内部データ情報:</strong><br>`;

    // ★勉強ポイント3：Object.entries でオブジェクトを回す
    // 「箱（オブジェクト）に入っているラベル（key）と中身（value）を全部チェックするよ」
    // TODO:　オブジェクトのキー（プロパティ名？）と値を全部取ってきて、キーがkey変数, 値がvalue変数に一つずつ代入される
    for (const [key, value] of Object.entries(info)) {
      htmlContent += `・${key}: ${value}<br>`;
    }
    htmlContent += `</div>`;

    // --- 天気予報の表示エリア ---

    htmlContent += `<div><strong>天気予報:</strong><br>`;

    // ★勉強ポイント1（再）：予報配列を for...of で回す
    for (const forecast of data.forecasts) {
      htmlContent += `
                        <div class="forecast-item">
                            ${forecast.date} : ${forecast.telop} 
                            (最高 ${forecast.max}℃ / 最低 ${forecast.min}℃)
                        </div>
                    `;
    }

    htmlContent += `</div></div>`; // カードを閉じる
  }

  // 最後に画面にドーンと表示！
  container.innerHTML = htmlContent;
}

// ーーーーーーーーーーーーーーーーーー

// 画面に表示する関数（見本）
// 1) データを整理するだけの関数
/**
 * TODO: 返り値は(3) [{…}, {…}, {…}]の形だと思う
 * TODO: 型の情報を追加する
 * @param {object[]} data
 * @returns {object[]}
 */
function getThreeDayForecast(data) {
  // 3件分のデータ（配列）を取得
  const forecasts = data?.forecasts ?? [];
  // 新しい配列（1つずつのオブジェクトに対して無駄なデータを消しただけの配列）を作成して返す
  return forecasts.map((forecast) => {
    const date = forecast.date ?? "なし";
    const dateLabel = forecast.dateLabel ?? "なし";
    const telop = forecast.telop ?? "なし";
    return { date, dateLabel, telop };
  });
}

// 2) 表示用のHTMLを作るだけの関数
/**
 *
 * @param {Array} forecastList
 * @returns
 */
function renderForecastList(forecastList) {
  if (forecastList.length === 0) {
    return "<p>天気予報が取得できませんでした</p>";
  }
  // TODO: リストが連なると予測している
  // TODO: mapということは新しい配列を作成してる？itemsHtmlはArray？
  // joinによって、itemsHtmlは配列じゃなくて文字列になっている
  const itemsHtml = forecastList
    .map(
      (item) => `
        <ul>
          <li>日付：${item.date}（${item.dateLabel}）</li>
          <li>天気：${item.telop}</li>
        </ul>
      `,
    )
    .join("");

  return `<h2>場所：東京</h2>${itemsHtml}`;
}

// 3) 実際に使う部分（renderWeather内など）
function renderWeather(data) {
  const container = document.getElementById("weather-container");
  const forecastList = getThreeDayForecast(data);
  container.innerHTML = renderForecastList(forecastList);
}

// ーーーーーーーーーーーーーーーーーーーー

function isValidNumericInput(value) {
  // 前後の空白を削除
  const trimmed = value.trim();
  // 空文字だったらfalse返す
  if (trimmed === "") return false;
  // 0~9の数字か確認する
  // .test()は正規表現と指定された文字列を照合するための検索を実行します。
  // 一致があった場合は true を、それ以外の場合は false を返します。
  return /^[0-9]+$/.test(trimmed);
}

// 使い方例
const input = " 0012 ";
if (isValidNumericInput(input)) {
  console.log("有効な数字入力");
} else {
  console.log("無効な入力");
}

// ーーーーーーーーーーーーーーーーーー

/**
 * 3日分の降水確率が入っている配列を作成する処理
 * @param {{forecasts: Array<{chanceOfRain:Object}>}} data API通信で取得したデータ
 * @returns {Array<Array<string>>} 3日分の降水確率が入っている配列
 */
function makeChanceOfRainArray(data) {
  const result = []; // 3日分を入れる
  // iは更新されるからlet
  for (let i = 0; i <= 2; i++) {
    // 1日分の配列を作成
    // ここがconst なのは、arrayはpushされるだけで参照の値（？）が変わっているわけじゃないから
    const array = [];
    // インデックスiのときの降水確率を取得
    const chanceOfRainObj = data.forecasts[i].chanceOfRain;
    // Object.valuesで、オブジェクトの値だけを抽出した配列を作る
    for (const value of Object.values(chanceOfRainObj)) {
      // ここで％を削除しながらarray配列に一つずつ値をプッシュする
      array.push(value.slice(0, -1));
    }
    // 4つ揃ったら1日分として保存
    result.push(array);
  }
  return result;
}

// 1日分の降水確率の配列が引数
function calculateChanceOfRain(array) {
  // arrayは4つの数字文字列が入った配列
  const noRainArray = array.map((item) => 100 - Number(item));
  // その日、1日の雨の降らない確率を求める
  const chanceOfNoRain =
    (noRainArray[0] / 100) *
    (noRainArray[1] / 100) *
    (noRainArray[2] / 100) *
    (noRainArray[3] / 100);
  // 1日のうちに雨の降る確率を求めて四捨五入して返す
  return Math.round((1 - chanceOfNoRain) * 100);
}

// TODO:　関数作る、分割する
// TODO:　返り値と引数も決める
/**
 * 今日・明日・明後日で最も降水確率が高い日を判定する関数
 * @param {Object} API通信で取得したデータ
 * @returns {string} 今日・明日・明後日で最も降水確率が高い日を返す
 */
function judgeOfRainDay(data) {
  // 使い方イメージ
  const allArrays = makeChanceOfRainArray(data);
  // 全部の配列から、1日分ごとの配列取り出して3日分の1日あたりの降水確率（？）の配列を作成
  // 1日あたりの雨が降る確率[20,10,40]みたいな形の配列がchanceArray代入される
  const chanceOfArray = allArrays.map(calculateChanceOfRain);

  // chanceArrayの中から最大値のインデックスを取得
  // (...)はスプレッド構文
  const max = Math.max(...chanceOfArray);
  // そのインデックスから今日・明日・明後日で最も降水確率が高い日を表示する
  const maxIndex = chanceOfArray.indexOf(max);

  if (maxIndex === 0) "今日";
  else if (maxIndex === 1) "明日";
  else "明後日";
} // allArrays
