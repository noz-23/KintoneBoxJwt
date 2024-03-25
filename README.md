# KintoneBoxJwt

## Kintone と Box の JWT認証用プラグイン

## 1.概要

Kintone でOAuth2.0認証が利用できないときに、JWT認証するためのプラグインです。

セキュリティの為に、JavaScriptにJWT認証用ファイル(JSON)の内容を埋め込むのは危険なため、

JWT認証用ファイルの内容は、Kintoneのプラグイン設定に保存、利用時に呼び出して利用する形式にしています。

### イメージ

  ![kintoneBoxJwt](https://github.com/noz-23/KintoneBoxJwt/assets/160399039/486af437-68f6-4227-8a26-3453f9db4c01)

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

    https://js.cybozu.com/jquery/3.7.1/jquery.min.js
          

jsrender :https://www.jsviews.com

    https://js.cybozu.com/jsrender/1.0.13/jsrender.min.js


axios    :https://github.com/axios/axios

    https://cdn.jsdelivr.net/npm/axios@1.1.2/dist/axios.min.js


jsrsasign:https://github.com/kjur/jsrsasign

    https://cdnjs.cloudflare.com/ajax/libs/jsrsasign/11.1.0/jsrsasign-all-min.js


## 6.バージョン履歴

 2024/02/19 0.0.1 初版とりあえず公開バージョン(GitHubの練習)

 2024/03/15 0.1.0 リンクで指定したフォルダに特定の文字のフォルダを作成出来るように更新

 2024/03/24 0.2.0 プラグイン設定画面に Google AdSense 追加

## 7.連絡

nzds23@yahoo.co.jp

## 8.商用利用

ライセンス条項を守って頂ければ特に制限ありません。

可能なら記載したいので、メールアドレスに連絡頂ければ幸いです。

プラグイン設定画面で Google AdSense の広告表示をしています。

わかり易くしてますので、削除は自分でやって下さい。


