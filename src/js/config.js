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

(async ( jQuery_,PLUGIN_ID_)=>{
  'use strict';

  // 読み込んだファイル
  var filedata ={};

  // 設定パラメータ
  const ParameterJsonFile='paramJsonFile';
  const ParameterFieldLink   ='paramFieldLink';   // リンクフィールド
  const ParameterFieldCalculate='paramFieldCalculate';    // 計算フィールド

  // 環境設定
  const Parameter = {
  // 表示文字
    Lang:{
      en:{
        plugin_titile      : 'Setting For Kintone x Box JWT Authentication Plugin',
        plugin_description : 'Please select Box JWT JSON File',
        plugin_label       : 'JWT JSON File     ',
        link_label         : 'Link Field        ',
        calc_label         : 'String Field      ',
        plugin_cancel      : 'Cancel',
        plugin_ok          : ' Save ',
      },
      ja:{
        plugin_titile      : 'Kintone x Box JWT 認証用 プラグイン',
        plugin_description : 'Box JWT JSON ファイルを選択して下さい',
        plugin_label       : 'JWT JSON ファイル           ',
        link_label         : 'リンクフィールド(作成場所)  ',
        calc_label         : '文字列フィールド(フォルダ名)',
        plugin_cancel      : 'キャンセル',
        plugin_ok          : '   保存  ',
      },
      DefaultSetting:'ja',
      UseLang:{}
    },
    Html:{
      Form       : '#plugin_setting_form',
      Title      : '#plugin_titile',
      Description: '#plugin_description',
      Label      : '#plugin_label',
      CalcLabel  : '#calc_label',
      Cancel     : '#plugin_cancel',
      Ok         : '#plugin_ok',
    },
    Elements:{
      Input      : '#plugin_input',
      LinkField  : '#link_field',
      CalcField  : '#calc_field',
    },
  };

 
  /*
  HTMLタグの削除
   引数　：htmlstr タグ(<>)を含んだ文字列
   戻り値：タグを含まない文字列
  */
  const escapeHtml =(htmlstr)=>{
    return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&quot;').replace(/'/g, '&#39;');
  };  

  /*
  ユーザーの言語設定の読み込み
   引数　：なし
   戻り値：なし
  */
  const settingLang=()=>{
    // 言語設定の取得
    Parameter.Lang.UseLang = kintone.getLoginUser().language;
    switch( Parameter.Lang.UseLang)
    {
      case 'en':
      case 'ja':
        break;
      default:
        Parameter.Lang.UseLang =Parameter.Lang.DefaultSetting;
        break;
    }
    // 言語表示の変更
    var html = jQuery(Parameter.Html.Form).html();
    var tmpl = jQuery.templates(html);
    
    var useLanguage =Parameter.Lang[Parameter.Lang.UseLang];
    // 置き換え
    jQuery(Parameter.Html.Form).html(tmpl.render({lang:useLanguage})).show();
  };

  /*
  フィールド設定
   引数　：なし
   戻り値：なし
  */
  const settingHtml= async ()=>{
    var listFeild =await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {'app': kintone.app.getId()});
    console.log("listFeild:%o",listFeild);

    for (const key in listFeild.properties){
      //console.log("properties key:%o",key);
      try {
        const prop = listFeild.properties[key];
        //console.log("prop:%o",prop);
    
        // Linkフィールドのみ入れる
        if (prop.type === 'LINK'){
          const option = jQuery('<option/>');
          option.attr('value', escapeHtml(prop.code)).text(escapeHtml(prop.label));
          console.log("Add LINK option:%o",option);
          jQuery(Parameter.Elements.LinkField).append(option);
        }                 
        // 計算フィールドのみ入れる
        if (prop.type === 'CALC'
         || prop.type === 'SINGLE_LINE_TEXT'){
          const option = jQuery('<option/>');
          option.attr('value', escapeHtml(prop.code)).text(escapeHtml(prop.label));
          console.log("Add Char option:%o",option);
          jQuery(Parameter.Elements.CalcField).append(option);
        }
      }
      catch (error) {
        console.log("error:%o",error);
      }

      // 現在データの呼び出し
      var nowConfig =kintone.plugin.app.getConfig(PLUGIN_ID_);
      console.log("nowConfig:%o",nowConfig);

      // 現在データの表示
      if(nowConfig[ParameterFieldLink]){
        jQuery(Parameter.Elements.LinkField).val(nowConfig[ParameterFieldLink]); 
      }
      if(nowConfig[ParameterFieldCalculate]){
        jQuery(Parameter.Elements.CalcField).val(nowConfig[ParameterFieldCalculate]); 
      }
      if(nowConfig[ParameterJsonFile]){
        filedata =nowConfig[ParameterJsonFile]; 
      }  
    }
  };

  /*
  入力したファイルの処理
   引数　:event_ 読み込んだファイル
   戻り値:なし
  */
  const inputFile=(event_)=>{
    //console.log('event_:%o',event_);
    var file =event_.target.files[0];
    //console.log('file:%o',file);

    var reader =new FileReader();
    reader.readAsText(file);
    reader.onload=(ev)=>{
      // 読み込んだファイル(テキスト)をそのまま保存
      //console.log('ev:%o',ev);
      filedata=ev.target.result;
    };
  };
   
  /*
  データの保存
   引数　：なし
   戻り値：なし
  */
   const saveSetting=()=>{
    // 各パラメータの保存
    var config ={};
    config[ParameterJsonFile] =filedata;
    config[ParameterFieldLink]=jQuery(Parameter.Elements.LinkField).val();
    config[ParameterFieldCalculate]=jQuery(Parameter.Elements.CalcField).val();

    console.log('config:%o',config);

    // 設定の保存
    kintone.plugin.app.setConfig(config);
  };

  // 言語設定
  settingLang();
  await settingHtml();
  
  // ファイル
  jQuery(Parameter.Elements.Input).change((e) =>{inputFile(e);});
  // 保存
  jQuery(Parameter.Html.Ok).click(() =>{saveSetting();});
  // キャンセル
  jQuery(Parameter.Html.Cancel).click(()=>{history.back();});
})(jQuery, kintone.$PLUGIN_ID);
