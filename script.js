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
    // makeChanceOfRainArray(data);

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
// --%のときは無視する
// function calculateChanceOfRain(data) {
//   // keyが時間帯、valueが降水確率
//   for (let i = 0; i <= 2; i++) {
//     const chanceOfRain = data.forecasts[i].chanceOfRain;
//     for (const [key, value] of Object.entries(chanceOfRain)) {
//       console.log(`${key}: ${value}`);
//       console.log(chanceOfRain);
//     }
//   }
// }
// 今日の6時～24までの降水確率を調べる→明日と明後日も同じ処理をする
// そのデータを使用して雨がどこでも降らない確率（どこでも雨が降らない確率を4つ掛け算して）を求める
// その数を1から引く→どこかで雨が降る確率がわかる

// for (const [key, value] of Object.entries(object)) {
//   console.log(`${key}: ${value}`);
// }

// TODO: 3日分の配列を返す
// function makeChanceOfRainArray(data) {
//   // keyが時間帯、valueが降水確率
//   for (let i = 0; i <= 2; i++) {
//     console.log("hello");
//     // ? 1日分ごとに配列が作成される？
//     let array = [];
//     const chanceOfRainObj = data.forecasts[i].chanceOfRain;
//     for (const [key, value] of Object.entries(chanceOfRainObj)) {
//       console.log(`${key}: ${value}`);
//       // %だけ削除した降水確率の配列（文字列）
//       array.push(value.slice(0, -1));
//       if (array.length === 4) {
//         const chanceOfRainArray = array;
//         console.log(chanceOfRainArray);
//       }
//     }
//   }
//   // return array;
// }

/**
 * 3日分の降水確率の配列を作成する処理
 * TODO:　配列の値の型も追加しておく
 * @param {Object} data API通信で取得したデータ一覧
 * @returns {Array<Array>} 3日分の降水確率の配列
 */

function makeChanceOfRainArray(data) {
  // 3日分にする（forループ）
  for (let i = 0; i <= 2; i++) {
    const threeDayArray = [];
    // 1日分ずつdataのforecastsのchanceOfRainの値を取得する（ループ）
    // オブジェクトの値を配列にする処理を追加
    for (const value of Object.values(data.forecasts[0].chanceOfRain)) {
      const array = [];
      // valueの％を削除する
      const chance = value.slice(0, -1);
      // そのデータで1日分の配列を作成する
      array.push(chance);
    }
    // 3日分の配列にする
    threeDayArray.push(array);
  }
}

/**
 *
 * @param {*} array
 * @returns
 */
function calculateChanceOfRain(array) {
  // 雨がどこでも降らない確率（どこでも雨が降らない確率を4つ掛け算して）を求める
  // インデックス0の値を1から引く
  // TODO: 文字列がいつのまにか数字になっている？！
  const noRainArray = array.map((item) => {
    const result = 100 - item;
    return result;
  });
  console.log(noRainArray);
  const chanceOfNoRain =
    (noRainArray[0] / 100) *
    (noRainArray[1] / 100) *
    (noRainArray[2] / 100) *
    (noRainArray[3] / 100);
  // dailyRainChance は「1日のうちどこかで雨が降るかもしれない確率」だからAPIで取れた降水確率とは違う
  const dailyRainChance = Math.round((1 - chanceOfNoRain) * 100);
  console.log(`dailyRainChance:${dailyRainChance}%`);
  console.log(chanceOfRainObj);
  return dailyRainChance;
}
