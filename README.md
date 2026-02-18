# お天気チェッカー 🌤️

都市名を入力すると、3日分の天気予報と降水確率を表示するWebアプリです。

天気データは [Open-Meteo API](https://open-meteo.com/) から取得しています。

## 必要なもの

- Node.js（v18以上推奨）

## セットアップ

```bash
# 1. リポジトリをクローン
git clone https://github.com/IchikaCoding/weather-checker-v1.git
cd weather-checker-v1

# 2. パッケージをインストール
npm install

# 3. サーバーを起動
npm start
```

## 使い方

1. サーバー起動後、ブラウザで http://localhost:3000/ を開く
2. 入力欄に都市名（例：東京、大阪、福岡）を入力する
3. 「天気を取得する」ボタンを押す
4. 3日分の天気と降水確率が表示される

## 技術スタック

- **フロントエンド**: HTML / CSS（Bootstrap 5） / JavaScript
- **バックエンド**: Node.js / Express
- **天気データ**: [Open-Meteo API](https://open-meteo.com/)（openmeteo パッケージ使用）
