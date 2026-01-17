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
    const res = await fetch(
      `https://weather.tsukumijima.net/api/forecast/city/${locationId}`
    );
    if (!res.ok) {
      throw new Error("404エラー！！");
    }
    const dataObj = await res.json();
    return dataObj;
  } catch (error) {
    return error;
  }
}

// 2. メインの処理
async function main() {
  try {
    const locationIdElement = document.getElementById("location-id");

    const container = document.getElementById("weather-container");
    const id = Number(locationIdElement.value);
    console.log(id);
    // TODO: この読み込み中は別の関数で実行したほうがいいかも！
    container.innerHTML = "読み込み中..."; // 待ち時間の演出
    // TODO: なぜここでawait？awaitしないとundefinedになってしまうから？
    // 非同期処理で取得したデータを使うなら、全部awaitが必要になるってこと？
    const data = await fetchWeather(id);
    // 同期処理だからawaitは不要！
    renderWeather(data);
  } catch (error) {
    console.error(error);
  }
}

// locationIdとして入力されたインプットを加工する処理
// カンマ区切り→split
// 余計な空白を削除→trim
function processData(locationStringId) {
  locationStringId.split(",");
}

function getThreeDayData(data) {
  forecastInfoArray = data.forecasts.map((forecast) => {
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
function makeHtmlElement(forecastInfoArray) {
  if (forecastInfoArray.length === 0) {
    return `<p>天気予報が取得できませんでした😱</p>`;
  }
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
