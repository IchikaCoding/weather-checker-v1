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
    container.innerHTML = "読み込み中..."; // 待ち時間の演出
    // TODO: なぜここでawait？
    const data = await fetchWeather(id);
    await renderWeather(data);
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

// 表示する関数
// コンテナを用意する
// 取得したデータをもらって、その天気予報のプロパティから一部のデータをコンテナに追加する
// この処理は、mainで非同期で実行する

function renderWeather(data) {
  // console.log(data);
  const container = document.getElementById("weather-container");
  // データがなかったら場合の処理
  if (!data || !data.forecasts) {
    container.textContent = "天気予報が取得できませんでした";
  }
  console.log(getThreeDayForecast(data));
  // const date = data?.forecasts[0].date || "なし";
  // const dateLabel = data?.forecasts[0].dateLabel || "なし";
  // const telop = data?.forecasts[0].telop || "なし";
  // console.log(date);
  // console.log(dateLabel);
  // console.log(telop);
  // container.innerHTML = `<h2>場所：東京</h2>
  //     <ul>
  //       <li>日付：${date}（${dateLabel}）</li>
  //       <li>天気：${telop}</li>
  //     </ul>`;
}

// 今日・明日・明後日のデータを取得
// TODO: 天気予報の情報を保管しておくための配列を用意
// 「??」はnull合体演算子で、これなら 左辺がnull または undefined の場合に右辺を使用する
// 「||」なら空文字や0も右辺が使われる！
// getは違う！
function getThreeDayForecast(data) {
  let forecastInfoArray = [];
  for (const forecast of data.forecasts) {
    const date = forecast.date ?? "なし";
    const dateLabel = forecast.dateLabel ?? "なし";
    const telop = forecast.telop ?? "なし";
    // console.log(date);
    // console.log(dateLabel);
    // console.log(telop);
    forecastInfoArray.push({ date, dateLabel, telop });
    // 表示する
    const container = document.getElementById("weather-container");
    container.innerHTML =
      container.innerHTML +
      `<h2>場所：東京</h2>
     <ul>
      <li>日付：${date}（${dateLabel}）</li>
    <li>天気：${telop}</li>
    </ul>`;
  }
  return forecastInfoArray;
}
