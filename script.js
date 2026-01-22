/**
 * ボタンを押したらmain()が実行される即時実行関数
 */
(() => {
  const weatherBtnElement = document.getElementById("weather-btn");
  // weatherBtnElementがなかった場合のガード
  if (!weatherBtnElement) return;
  weatherBtnElement.addEventListener("click", main);
})();

/**
 * API通信をして、天気予報のデータをJSオブジェクトとして取得する処理
 * @param {string} locationId 場所のID
 * @returns {Object} dataObj APIで取得したデータのJSのオブジェクト
 */
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

/**
 * メインの処理
 */
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
    console.log(makeThreeDayChanceOfRainArray(data));
    // 同期処理だからawaitは不要！
    renderWeather(data);
    displayTitle();
    displayMessage(judgeOfRainDay(data));
  } catch (error) {
    console.error(error);
    displayError(error);
  }
}
/**
 * main()で発生したエラーを表示する処理
 * @param {Error} error main()で発生したエラー
 */
function displayError(error) {
  const container = document.getElementById("weather-container");
  container.innerHTML = `<h2>天気予報が取得できませんでした😱</h2><p>${error.message}</p>`;
}

/**
 * APIのデータを取得できたかどうかを確認する処理
 * @param {Object} data API通信で取得したデータ
 * @returns {Object} data API通信で取得したデータ
 */
function checkData(data) {
  console.log("checkData動いた🐣");
  if (data === null || data === undefined) {
    throw new Error("データが取得できませんでした");
  }
  return data;
}

/**
 * 入力されたIDを取得する処理
 * @returns {string} idを文字列で返す
 */
function getId() {
  const locationIdElement = document.getElementById("location-id");
  return locationIdElement.value;
}

/**
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

/**
 * 前後のスペースを削除する処理
 * @param {string} id
 * @returns {string} trimmed
 */
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
 * 今日・明日・明後日の天気予報のデータを取得する処理
 * @param {Object} data API通信で取得したデータ
 * @returns {{city: string, forecastInfoArray: Array}} 都市名と天気予報のデータを返す
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

/**
 * 天気予報のデータからHTMLの要素を作成する処理
 * @param {Object} dataObj
 * @returns {string} HTMLの要素をテンプレートリテラルで作成して返す
 */
function makeHtmlElement(dataObj) {
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

/**
 * 3日分の降水確率の配列を作成する処理
 * @param {Object} data API通信で取得したデータ一覧
 * @returns {Array<Array>} 3日分の降水確率の配列
 */
function makeThreeDayChanceOfRainArray(data) {
  const threeDayArray = [];
  // 3日分にする（forループ）
  for (let i = 0; i <= 2; i++) {
    const array = [];
    // 1日分ずつdataのforecastsのchanceOfRainの値を取得する（ループ）
    // オブジェクトの値を配列にする処理を追加
    for (const value of Object.values(data.forecasts[i].chanceOfRain)) {
      // valueの％を削除する
      let chance = value.slice(0, -1);
      if (chance === "--") {
        chance = null;
      }
      // そのデータで1日分の配列を作成する
      array.push(chance);
    }
    // 3日分の配列にする
    threeDayArray.push(array);
  }
  return threeDayArray;
}

/**
 * 雨が降る確率（1日バージョン）を算出する処理
 * @param {Array<Array>} array makeChanceOfRainArrayの返り値threeDayArrayがわたる
 * @returns {number} dailyRainChance 一日のうちのどこかで雨が降る確率
 */
function calculateChanceOfRain(array) {
  // 雨がどこでも降らない確率（どこでも雨が降らない確率を4つ掛け算して）を求める

  // 計算するときはnullは除外。
  // noRainArrayの要素数はnullはそのままnullにしておいて変えない。
  const noRainArray = array.map((item) => {
    // もしnullだったらnullを返す、
    // 値が入っていたらその値を使って、100から引き算する
    if (item === null) {
      return null;
    } else {
      const result = 100 - Number(item);
      return result;
    }
  });
  console.log(noRainArray);

  // for (let i = 0; i <= 3; i++) {}
  // noRainArrayの要素をそれぞれ100で割る（map）→ array
  // chanceOfNoRain
  // 合計変数を用意→掛け算を繰り返す

  const chanceOfNoRain = chanceOfNoRainFunc(noRainArray);
  // dailyRainChance は「1日のうちどこかで雨が降るかもしれない確率」だからAPIで取れた降水確率とは違う
  const dailyRainChance = Math.round((1 - chanceOfNoRain) * 100);
  console.log(`dailyRainChance:${dailyRainChance}%`);
  console.log(chanceOfNoRain);
  return dailyRainChance;
}

//--------------------------------------
// "--"はnullなので、100として掛け算して結果に影響させないようにした。
/**
 * 雨が降らない確率を算出する処理
 * ! 返り値が分かりづらいから要注意！
 * @param {Array<number>} noRainArray
 * @returns {Number} chanceOfNoRain 一日のうちのどこかでも雨が降らない確率
 */
function chanceOfNoRainFunc(noRainArray) {
  // const noRainArray = [10, 20, 30, 40];
  console.log("chanceOfNoRainFuncが来た！！");

  const initialValue = 1;
  const chanceOfNoRain = noRainArray.reduce(
    // initialValue が指定されたらその値。array[0]の値。
    (accumulator, currentValue) => {
      const value = currentValue === null ? 100 : currentValue;
      return accumulator * (value / 100);
    },
    initialValue,
  );

  console.log(chanceOfNoRain);
  return chanceOfNoRain;
}

// TODO:　関数作る、分割する
/**
 * 今日・明日・明後日で最も降水確率が高い日を判定する関数
 * @param {Object} API通信で取得したデータ
 * @returns {Object{maxChanceOfRain: Number, dateLabel: string}} 今日・明日・明後日で最も降水確率が高い日を返す
 */
function judgeOfRainDay(data) {
  console.log("API通信で取得したデータ", data);
  // 使い方イメージ
  const allArrays = makeThreeDayChanceOfRainArray(data);
  console.log({ allArrays });
  // 全部の配列から、1日分ごとの配列取り出して3日分の1日あたりの降水確率（？）の配列を作成
  // 1日あたりの雨が降る確率[20,10,40]みたいな形の配列がchanceArray代入される

  const chanceOfArray = allArrays.map((array) => {
    return calculateChanceOfRain(array);
  });
  // ! mapなら自動的に引数が渡されるし、結果もリターンされるから以下の書き方でもOK！
  // const chanceOfArray = allArrays.map(calculateChanceOfRain);

  console.log(chanceOfArray);
  // chanceArrayの中から最大値のインデックスを取得
  // (...)はスプレッド構文
  const max = Math.max(...chanceOfArray);
  // そのインデックスから今日・明日・明後日で最も降水確率が高い日を表示する
  const maxIndex = chanceOfArray.indexOf(max);
  const dateLabels = ["今日", "明日", "明後日"];
  console.log(dateLabels[maxIndex]);
  return { dateLabel: dateLabels[maxIndex], maxChanceOfRain: max };
} // allArrays,chanceOfArray,max,maxIndex,message

// 画面に降水確率が最も高い日を表示する処理
// 引数はjudgeOfRainDay(data)の返り値
/**
 * 一日のうちどこかで雨が降る確率を取得して、その確率に応じたメッセージを表示する関数
 * @param {Object{dateLabel: string, maxChanceOfRain: number}} {dateLabel, maxChanceOfRain} judgeOfRainDay()で取得した「降水確率と日付のラベル」
 */
function displayMessage({ dateLabel, maxChanceOfRain }) {
  console.log(maxChanceOfRain, dateLabel);
  const rainMessageElement = document.getElementById("rain-message");
  // もし70%以上だったら傘忘れずに
  // 40％以上なら
  // 変数を作成したら初期値をいれることは徹底しよう！
  let message = "";
  if (maxChanceOfRain >= 70) {
    message = "傘を忘れずに☔";
  } else if (maxChanceOfRain >= 40) {
    message =
      "折りたたみ傘があると安心（風が吹いたら傘が反対向きにはなるかも🥺）";
  } else {
    message = "傘は不要だよん♪";
  }
  rainMessageElement.textContent = `${dateLabel} : ${maxChanceOfRain}%の降水確率。${message}`;
}

/**
 * 一日のうちどこかで雨が降る確率を表示する処理
 */
function displayTitle() {
  const titleChanceOfRainElement = document.getElementById(
    "title-chance-of-rain",
  );
  titleChanceOfRainElement.textContent =
    "一日のうちどこかで雨が降る確率は、、？";
}
