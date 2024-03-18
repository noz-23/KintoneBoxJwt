/*
 * Kintone x Box JWT認証
 * Copyright (c) 2024 noz-23
 *  https://github.com/noz-23/
 * 
 * Licensed under the MIT License 
 *
 *  利用：
 *   JQuery:
 *     https://jquery.com/
 *     https://js.cybozu.com/jquery/3.7.1/jquery.min.js
 *   
 *   jsrender:
 *     https://www.jsviews.com/
 *     https://js.cybozu.com/jsrender/1.0.13/jsrender.min.js
 * 
 *   axios:Promise based HTTP client for the browser
 *     https://github.com/axios/axios
 *     https://cdn.jsdelivr.net/npm/axios@1.1.2/dist/axios.min.js
 *   
 *   jsrsasign:opensource free pure JavaScript cryptographic library
 *     https://github.com/kjur/jsrsasign
 *     https://cdnjs.cloudflare.com/ajax/libs/jsrsasign/11.1.0/jsrsasign-all-min.js
 * 
 * History
 *  2024/02/19 0.0.1 初版とりあえずバージョン
 *  2024/03/15 0.1.0 フォルダ作成等の基本機能追加
 */ 
 
 jQuery.noConflict();

(async ( PLUGIN_ID_) => {
  'use strict';
  // AUTH URLの定数宣言
  const BOX_AUTH_BASE_PATH = "https://api.box.com/oauth2/token";
  // API URLの定数宣言
  const BOX_API_BASE_PATH  = 'https://api.box.com/2.0';

  // Box ヘッダーベース
  const BoxHeaderBase ={'Authorization':'Bearer ','content-type':'application/json'};



  // 初期化
  const Inital=async ()=>{
    // 設定の読み込み
    var param =kintone.plugin.app.getConfig(PLUGIN_ID_);
    // テキストからJSONへ変換
    var configJson=JSON.parse(param.paramJsonFile);
    //console.log('configJson',configJson);
    BoxHeaderBase.Authorization ='Bearer '+await getBoxAccessToken(configJson);
    //console.log('Inital BoxHeaderBase',BoxHeaderBase);
  }
  
  /*
  JWT認証
   引数　：config_ 認証用JSON
   戻り値：アクセストークン
  */
  const getBoxAccessToken =async( config_)=>{
    // JWT のデータ構造
    // 秘密キーをパスコードを使って複合化
    const privateKey = KEYUTIL.getKey(config_.boxAppSettings.appAuth.privateKey, config_.boxAppSettings.appAuth.passphrase);
 
    // ヘッダーを宣言
    const objHeader = {
      algorithm: 'RS256',
      keyid: config_.boxAppSettings.appAuth.publicKeyID
    };
    const strHeader = JSON.stringify(objHeader);
 
    // ペイロード
    const objPayload ={
      iss : config_.boxAppSettings.clientID,
      sub : config_.enterpriseID,
      box_sub_type : 'enterprise',
      aud : BOX_AUTH_BASE_PATH,
      jti: KJUR.crypto.Util.getRandomHexOfNbytes(64),
      exp : Math.floor(Date.now() / 1000) + 45
    };
    const strPayload = JSON.stringify(objPayload);

    // ヘッダー、ペイロードをキー情報を使って署名
    const assertion = KJUR.jws.JWS.sign('RS256', strHeader, strPayload, privateKey);

    // クエリ文字列作成用のオブジェクト宣言
    const queryObj = {
      grant_type   : 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion    : assertion,
      client_id    : config_.boxAppSettings.clientID,
      client_secret: config_.boxAppSettings.clientSecret
    }
    //console.log('queryObj',queryObj);
    
    // トークンの取得
    return await axios.post(BOX_AUTH_BASE_PATH,queryObj).then((res)=>{return res.data.access_token;});
  };

  /*
  Box 利用者情報
   引数　：mail_ メールアドレス
   戻り値：Box 利用者情報
  */ 
  const GetBoxUser =async( mail_)=>{
    console.log('GetBoxUser BoxHeaderBase',BoxHeaderBase);
    if( mail_==null)
    {
      // 自身の利用者情報
      return await axios.get(BOX_API_BASE_PATH+'/users/me',{ headers:BoxHeaderBase}).then((res)=>{return res.data;}); 
    }
    // メールアドレスの利用者情報
    return await axios.get(BOX_API_BASE_PATH+'/users',{headers:BoxHeaderBase,params:{ filter_term:mail_}}).then((res)=>{return res.data;}); 
  };

  /*
  Box のフォルダIDの取得
   引数　：sharedUrl_ 共有リンク
   戻り値：フォルダID
  */
  const GetBoxFolderID = async ( sharedUrl_)=>{
    // コピーしてから追加(他に影響与えないため)
    var copyHeadear = JSON.parse(JSON.stringify(BoxHeaderBase));
    copyHeadear.boxapi='shared_link='+ sharedUrl_;
    // フォルダ情報の取得
    return await axios.get(BOX_API_BASE_PATH+'/shared_items',{headers:copyHeadear}).then((res)=>{return res.data;});
  }

  /*
  フォルダ名の変更
   引数　：folderId_ フォルダID, rename_ 新しいフォルダ名
   戻り値：フォルダ名
  */
  const RenameFolder =async( folderId_, rename_)=>{
    return await axios.put(BOX_API_BASE_PATH+'/folders/'+folderId_,{name:rename_},{headers:BoxHeaderBase}).then((res)=>{return res.data;});
  }  

  /*
  フォルダ名の移動
   引数　：folderId_ フォルダID, parentFolderId_ 移動先(親)フォルダID
   戻り値：親フォルダID
  */
  const MoveFolder =async ( folderId_, parentFolderId_)=>{
    return await axios.put(BOX_API_BASE_PATH+'/folders/'+folderId_,{parent:{id:parentFolderId_}},{headers:BoxHeaderBase}).then((res)=>{return res.data;});
  }

  /*
  フォルダダウンロード許可
   引数　：folderId_ フォルダID, disabled_ ダウンロード無効化の場合｢true｣, acccess_ アクセス方法"open","company","collaborators" 
   戻り値：フォルダデータ
  */
  const SetSharedFolderDownload =async ( folderId_, disabled_, acccess_='open')=>{
    return await axios.put(BOX_API_BASE_PATH+'/folders/'+folderId_,{shared_link:{access:acccess_,permissions:{can_download:!disabled_}}},{headers:BoxHeaderBase}).then((res)=>{return res.data;});
  }

  // Kintone プラグイン  
  const EVENTS =[
    'app.record.create.show', // 作成表示
    'app.record.edit.show',   // 編集表示
    'app.record.index.show',  // 一覧表示
    'app.record.detail.show',  // 詳細表示
    'app.record.create.submit',     // 作成保存
    'app.record.edit.submit',       // 編集保存
    'app.record.index.edit.submit', // 一覧保存
  ];

  kintone.events.on(EVENTS, async (events_) =>{
    console.log('plugin events_:%o',events_);

    const config = kintone.plugin.app.getConfig(PLUGIN_ID_);
    console.log("config:%o",config);
    // 
    const paramFieldLink=config['paramFieldLink'];
    const paramFieldCalc=config['paramFieldCalc'];

    // JWT認証開始
    await Inital();  

    //var user =await GetBoxUser();
    //console.log('plugin user :%o',user);

    var boxUrl =events_.record[paramFieldLink].value;

    var boxFolderPattern = /^https:\/\/([a-zA-Z0-9+-_]+).box.(com|net)(\/folder\/)([a-zA-Z0-9+-_]+)\?s=([a-zA-Z0-9+-_]+)$/;
    var matchFolder =boxUrl.match(boxFolderPattern);
    console.log('matchFolder:%o',matchFolder);

    var boxLinkPattern   = /^https:\/\/([a-zA-Z0-9+-_]+).box.(com|net)(\/s\/[a-z0-9]+)$/;
    var matchLink = boxUrl.match(boxLinkPattern);
    console.log('matchLink:%o',matchLink);

  });

})(kintone.$PLUGIN_ID);
