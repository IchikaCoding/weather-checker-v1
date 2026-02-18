const express = require("express"); // Expressという「サーバーを簡単に作る道具」を読み込む
const path = require("path"); // ファイルの場所を扱う道具

// openmeteoパッケージはESM専用なので、動的import()で読み込む
// → require()だとエラーになるので、import()を使う
let fetchWeatherApi;
import("openmeteo").then((mod) => {
  fetchWeatherApi = mod.fetchWeatherApi;
  console.log("openmeteoパッケージ読み込み完了 ✅");
});

const app = express();

// 静的ファイル（HTML, CSS, JS）を配信する設定
app.use(express.static(path.join(__dirname)));

// ========== WMO天気コード → 日本語テキスト変換表 ==========
// Open-Meteoが返す天気コード（WMO国際基準）を日本語にする
const weatherCodeToJapanese = {
  0: "快晴",
  1: "晴れ",
  2: "一部曇り",
  3: "曇り",
  45: "霧",
  48: "霧",
  51: "小雨",
  53: "霧雨",
  55: "霧雨",
  56: "着氷性の霧雨",
  57: "着氷性の霧雨",
  61: "小雨",
  63: "雨",
  65: "大雨",
  66: "着氷性の雨",
  67: "着氷性の雨",
  71: "小雪",
  73: "雪",
  75: "大雪",
  77: "霧雪",
  80: "にわか雨",
  81: "にわか雨",
  82: "激しいにわか雨",
  85: "にわか雪",
  86: "激しいにわか雪",
  95: "雷雨",
  96: "雷雨",
  99: "雷雨",
};

// ========== ヘルパー関数 ==========

// 連続する数値の配列を作る関数（Open-Meteoの時間データ展開用）
const range = (start, stop, step) =>
  Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

// 時間帯ごとの降水確率の最大値を取得する関数
// precipArray: 1時間ごとの降水確率の配列
// dayStart: その日の最初のインデックス（0日目なら0、1日目なら24）
// slotStart, slotEnd: 時間帯の開始・終了（例: 6, 12 → 6時〜12時）
function getMaxPrecipForSlot(precipArray, dayStart, slotStart, slotEnd) {
  let max = 0;
  for (let h = slotStart; h < slotEnd; h++) {
    const idx = dayStart + h;
    if (idx < precipArray.length) {
      max = Math.max(max, precipArray[idx]);
    }
  }
  return `${Math.round(max)}%`;
}

// ========== ジオコーディング（都市名 → 緯度・経度） ==========
// Open-MeteoのジオコーディングAPIを使って、都市名から座標を取得
async function geocode(name) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=ja`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("ジオコーディングAPIエラー");
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("都市が見つかりませんでした");
  }
  return data.results[0]; // { name, latitude, longitude, ... }
}

// ========== 天気取得APIエンドポイント ==========
// ブラウザから /api/weather?name=東京 のようにアクセスすると天気データを返す
app.get("/api/weather", async (req, res) => {
  try {
    // openmeteoがまだ読み込まれていない場合のチェック
    if (!fetchWeatherApi) {
      return res.status(503).json({ error: "サーバー準備中です。少し待ってからもう一度試してください。" });
    }

    const cityName = req.query.name;
    if (!cityName) {
      return res.status(400).json({ error: "都市名を指定してください" });
    }

    // 1. 都市名 → 緯度・経度に変換
    const geo = await geocode(cityName);

    // 2. Open-Meteoで天気データを取得（fetchWeatherApiを使用）
    // 公式ドキュメント: https://open-meteo.com/en/docs
    const params = {
      latitude: geo.latitude,
      longitude: geo.longitude,
      hourly: ["precipitation_probability"],
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_probability_max",
      ],
      timezone: "Asia/Tokyo",
      forecast_days: 3,
    };

    const url = "https://api.open-meteo.com/v1/forecast";
    const responses = await fetchWeatherApi(url, params);

    // ドキュメントのパターンに従ってデータを展開する
    // Process first location
    const response = responses[0];

    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();

    const hourly = response.hourly();
    const daily = response.daily();

    // ドキュメントの weatherData オブジェクト形式に合わせる
    const weatherData = {
      hourly: {
        time: range(
          Number(hourly.time()),
          Number(hourly.timeEnd()),
          hourly.interval(),
        ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
        precipitationProbability: hourly.variables(0).valuesArray(),
      },
      daily: {
        time: range(
          Number(daily.time()),
          Number(daily.timeEnd()),
          daily.interval(),
        ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
        weatherCode: daily.variables(0).valuesArray(),
        temperature2mMax: daily.variables(1).valuesArray(),
        temperature2mMin: daily.variables(2).valuesArray(),
        precipitationProbabilityMax: daily.variables(3).valuesArray(),
      },
    };

    // 3. 旧APIと同じ形式のJSONに変換する
    const dateLabels = ["今日", "明日", "明後日"];
    const forecasts = [];

    for (let i = 0; i < 3; i++) {
      const date = weatherData.daily.time[i];
      const dateStr = date.toISOString().split("T")[0];
      const wmoCode = Math.round(weatherData.daily.weatherCode[i]);
      const dayStart = i * 24; // 1日目=0, 2日目=24, 3日目=48

      // 6時間ごとの降水確率を計算（hourlyデータから）
      const chanceOfRain = {
        T00_06: getMaxPrecipForSlot(
          weatherData.hourly.precipitationProbability,
          dayStart,
          0,
          6,
        ),
        T06_12: getMaxPrecipForSlot(
          weatherData.hourly.precipitationProbability,
          dayStart,
          6,
          12,
        ),
        T12_18: getMaxPrecipForSlot(
          weatherData.hourly.precipitationProbability,
          dayStart,
          12,
          18,
        ),
        T18_24: getMaxPrecipForSlot(
          weatherData.hourly.precipitationProbability,
          dayStart,
          18,
          24,
        ),
      };

      forecasts.push({
        date: dateStr,
        dateLabel: dateLabels[i],
        telop: weatherCodeToJapanese[wmoCode] || "不明",
        temperature: {
          min: {
            celsius: i === 0 ? null : String(Math.round(weatherData.daily.temperature2mMin[i])),
          },
          max: {
            celsius: String(Math.round(weatherData.daily.temperature2mMax[i])),
          },
        },
        chanceOfRain,
      });
    }

    // 旧APIと同じ形式で返す
    const result = {
      location: {
        city: geo.name,
      },
      forecasts,
    };

    res.json(result);
  } catch (error) {
    console.error("天気取得エラー:", error);
    res.status(500).json({ error: error.message });
  }
});

// トップページ → index.htmlを返す
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
