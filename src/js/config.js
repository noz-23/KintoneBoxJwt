jQuery.noConflict();

(($,PLUGIN_ID)=>{
  'use strict';

  // 読み込んだファイル
  var filedata ={};

  // 設定パラメータ
  const ParameterJsonFile='paramJsonFile';

  // 環境設定
  const Parameter = {
  // 表示文字
    Lang:{
      en:{
        plugin_titile      : 'Setting For Kintone x Box JWT Authentication Plugin',
        plugin_description : 'Please select Box JWT JSON File',
        plugin_label       : 'JWT JSON File ',
        plugin_cancel      : 'Cancel',
        plugin_ok          : ' Save ',
      },
      ja:{
        plugin_titile      : 'Kintone x Box JWT 認証用 プラグイン',
        plugin_description : 'Box JWT JSON ファイルを選択して下さい',
        plugin_label       : 'JWT JSON ファイル',
        plugin_cancel      : 'キャンセル',
        plugin_ok          : '   保存  ',
      },
      setting:'ja',
    },
    Html:{
      form       : '#plugin_setting_form',
      title      : '#plugin_titile',
      description: '#plugin_description',
      label      : '#plugin_label',
      input      : '#plugin_input',
      cancel     : '#plugin_cancel',
      ok         : '#plugin_ok',
    },
  };

  /*
  ユーザーの言語設定の読み込み
   引数　：なし
   戻り値：なし
  */
  const settingLang=()=>{
    // 言語設定の取得
    var useLang = kintone.getLoginUser().language;
    switch( useLang)
    {
      case 'en':
      case 'ja':
        break;
      default:
        useLang =Parameter.Lang.setting;
        break;
    }
    // 言語表示の変更
    var html = jQuery(Parameter.Html.form).html();
    var tmpl = jQuery.templates(html);
    
    var UseLanguage =Parameter.Lang[useLang];
    // 置き換え
    jQuery(Parameter.Html.form).html(tmpl.render({lang:UseLanguage})).show();
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
    console.log('filedata:%o',filedata);

    var config ={};
    config[ParameterJsonFile] =filedata;
    console.log('config:%o',config);

    kintone.plugin.app.setConfig(config);
  };

  // 言語設定
  settingLang();
  // ファイル
  jQuery(Parameter.Html.input).change((e) =>{inputFile(e);});
  // 保存
  jQuery(Parameter.Html.ok).click(() =>{saveSetting();});
  // キャンセル
  jQuery(Parameter.Html.cancel).click(()=>{history.back();});
})(jQuery, kintone.$PLUGIN_ID);
