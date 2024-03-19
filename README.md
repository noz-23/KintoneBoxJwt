# KintoneBoxJwt

## Kintone と Box の JWT認証用プラグイン

## 1.概要

Kintone でOAuth2.0認証が利用できないときに、JWT認証するためのプラグインです。
セキュリティの為に、JavaScriptにJWT認証用ファイル(JSON)の内容を埋め込むのは危険なため、
JWT認証用ファイルの内容は、Kintoneのプラグイン設定に保存、利用時に呼び出して利用する形式にしています。

### イメージ

## 2.注意点

①Kintoneの使用で、アプリの読み込みはJavaScriptの次に、プラグインの読み込みとなるため、現状では利用JavaScriptは組み込む形でご利用ください。

②box側のアプリ構成CORSドメイン設定に、Kintoneのドメインを入れないと認証されないので注意して下さい(忘れやすい)。

## 3.今後

利用できる関数セットの追加

プラグインで認証、JavaScriptで利用できる様に改良

## 4.ライセンス

MIT license

## 5.利用

JQuery   :https://jquery.com

jsrender :https://www.jsviews.com

axios    :https://github.com/axios/axios

jsrsasign:https://github.com/kjur/jsrsasign

## 6.バージョン履歴

0.0.1版 初版とりあえず公開バージョン(GitHubの練習)

0.1.0版 リンクで指定したフォルダに特定の文字のフォルダを作成出来るように更新

## 7.連絡

nzds23@yahoo.co.jp

## 8.商用利用

ライセンス条項を守って頂ければ特に制限ありません。

可能なら記載したいので、メールアドレスに連絡頂ければ幸いです。

