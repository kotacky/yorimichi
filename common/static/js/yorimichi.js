// マップ
var map;
// サービス
var service;
// 緯度
var lat;
// 経度
var lng;
// 緯度経度
var latlng;
// 住所
var address;
// ズーム
var zoom;
// 表示件数
var restriction_number = 5;
// IDリスト
var id_list = ["td1", "td2", "td3"];
//クッキーID
var cookie_id;
// IDリスト
var history_id_list = ["history_td1", "history_td2", "history_td3"];
// 表示する検索結果
var results = [];
// 結果一時格納用のリスト
var result_list = [];
// GET結果のlength
var response_length;

// cookie_id取得用
var r = document.cookie.split(';');
r.forEach(function(value) {

    // cookie名と値に分ける
    var content = value.split('=');
    // 実際に使用するcookie_id
    cookie_id = content[1];
    // テスト用で出力(cookie_idを使って運用ができる確認とれたら消す)
    console.log(cookie_id);
})




//検索ボタン有効化切り替え
$(function() {
    // ラジオボタンチェック時に有効化
    $(":radio").on('change', function() {
        if ($('#search_btn').is(':disabled')) {
            $('#search_btn').prop('disabled', false);
        }
    });
});

// マップの初期設定
function initialize() {
    // Mapクラスのインスタンスを作成
    navigator.geolocation.getCurrentPosition(

        // [第1引数] 取得に成功した場合の関数
        function( position ) {
            // 取得したデータの整理
            var data = position.coords ;
            // データの整理
            lat = data.latitude ;
            lng = data.longitude ;
            zoom = 18;
            mapTypeId : google.maps.MapTypeId.ROADMAP
            var alt = data.altitude ;
            var accLatlng = data.accuracy ;
            var accAlt = data.altitudeAccuracy ;
            var heading = data.heading ;            //0=北,90=東,180=南,270=西
            var speed = data.speed ;

            // 位置情報
            latlng = new google.maps.LatLng( lat , lng ) ;
            // 住所も取得する
            getAddress(latlng);

            // Google Maps作成
            NewMap();
        } ,
        // [第2引数] 取得に失敗した場合の関数
        function( error ) {
            // エラーコード(error.code)の番号
            // 0:UNKNOWN_ERROR                原因不明のエラー
            // 1:PERMISSION_DENIED            利用者が位置情報の取得を許可しなかった
            // 2:POSITION_UNAVAILABLE        電波状況などで位置情報が取得できなかった
            // 3:TIMEOUT                    位置情報の取得に時間がかかり過ぎた…

            // エラー番号に対応したメッセージ
            var errorInfo = [
                "原因不明のエラーが発生しました…。" ,
                "位置情報の取得が許可されませんでした…。" ,
                "電波状況などで位置情報が取得できませんでした…。" ,
                "位置情報の取得に時間がかかり過ぎてタイムアウトしました…。"
            ] ;

            // エラー番号
            var errorNo = error.code ;

            // エラーメッセージ
            var errorMessage = "[エラー番号: " + errorNo + "]\n" + errorInfo[ errorNo ] ;

            // アラート表示
            alert( errorMessage ) ;

        } ,
        // [第3引数] オプション
        {
            "enableHighAccuracy": false,
            "timeout": 8000,
            "maximumAge": 2000,
        }
    );
}

//初期マップ作成
function NewMap() {
    // Google Mapsに書き出し
    map = new google.maps.Map( document.getElementById( 'map-canvas' ) , {
        zoom: zoom ,                // ズーム値
        center: latlng ,        // 中心座標 [latlng]
        mapTypeId: google.maps.MapTypeId.ROADMAP
    } ) ;
    // マーカーの新規出力
    new google.maps.Marker( {
        map: map ,
        position: latlng ,
    } ) ;
}

// 入力キーワードと表示範囲を設定
function SearchGo() {
    // マップ初期化
    NewMap();
    results = []
    result_list=[]
    console.log(address);
    // POST用のJSONデータの定義
    var jsondata =  {
        user_id: cookie_id,
        search_place: address,
        search_time: dateToFormatString(new Date(), '%YYYY%-%MM%-%DD% %HH%:%mm%:%ss%'),
        category_name: $("input[name='radio_item']:checked").attr('id')
        };

    $.post( '../api/create/create_search_history', jsondata )
    // 結果受け取り
    .done(function( data ) {
        console.log("成功！");
    })

    // DBからサブカテゴリを取得
    $.ajax({
        'url':'../api/' + $("input[name='radio_item']:checked").val() + '/search/',
        'type':'GET',
        'data':{},
        'dataType':'json',
        'success':function(response){
            response_length = response.length;
            var array = [];
            for(var i in response){
                array.push(response[i].sub_category_name);
            }
            console.log(array)
            service = new google.maps.places.PlacesService(map);
            for(i=0; i< response.length; i++){
                // input要素に入力されたキーワードを検索の条件に設定
                var request = {
                    keyword :  response[i].sub_category_name,
                    location : latlng,
                    rankBy: google.maps.places.RankBy.DISTANCE
                };
                service.nearbySearch(request, resultPush)
            }
        },
    });
}

// 検索の結果を受け取り、配列に格納。全て受け取ったらresult_searchを呼ぶ
function resultPush(result, status) {
    result_list.push(result)
    if (result_list.length == response_length) {
        mainProc(result_list)
    }
}

// 検索の結果を受け取る
function mainProc(result_list) {
    // テーブル取得、表示、初期化
    var tbl = document.getElementById('place_list');
    tbl.style.display = "";
    while (tbl.rows.length > 1) tbl.deleteRow(1);
    // 検索結果が0件の場合、リターン
    if (result_list.length == 0) {
        return;
    }
    // 境界(Bounding box)のインスタンスを作成する
    var bounds = new google.maps.LatLngBounds();
    console.log(tbl);
        // 整理するために、全ての結果を配列resultsに集約する。また、距離の計算もここで行い、resultsオブジェクト「distance」に持たせる
    for (i = 0 ; i < result_list.length; i++) {
        for (j = 0; j < result_list[i].length ; j++) {
            var dist_lat = result_list[i][j].geometry.location.lat() ;
            var dist_lng = result_list[i][j].geometry.location.lng() ;
            var dist_latlng = new google.maps.LatLng( dist_lat , dist_lng ) ;
            var distance = google.maps.geometry.spherical.computeDistanceBetween(latlng, dist_latlng);
            var split_distance =String(distance).split(["."])
            // ついでに、「5km以内の場所」のみを表示対象にする
            if (split_distance[0] < 5000) {
                result_list[i][j].distance = split_distance[0]
                results.push(result_list[i][j]);
            }
        }
    }
     // 距離順にソート
    results.sort(compare);

    // マーカー設定
    for(var i = 0; i < restriction_number; i++){
        createMarker({
             position : results[i].geometry.location,
             text : results[i].name,
             map : map
        });
        // 一覧に表示する
        var tr = tbl.insertRow( tbl.rows.length );
        var td;
        for(var j = 0; j < id_list.length ; j++){
            td = tr.insertCell( tr.cells.length );
            td.id = id_list[j];
            switch (j) {
                // No.
                case 0:
                    td.appendChild( document.createTextNode(i + 1) );
                    break;
                // 店舗・施設
                case 1:
                    // リンクを設定する
                    var place_link = document.createElement('a');
                    place_link.setAttribute('href', "https://www.google.co.jp/search?q=" + results[i].name),
                    place_link.setAttribute('target', '_blank'),
                    place_link.innerHTML = results[i].name;
                    td.appendChild( place_link );
                    break;
                // 距離
                 case 2:
                    td.appendChild( document.createTextNode(results[i].distance + "m") );
                    break;
            }
        }
        // 境界に位置座標を追加する。
        bounds.extend(results[i].geometry.location);
    }
    // 境界が見えるように位置座標とズーム値を変更する
    map.fitBounds(bounds);
    // マップの中心地を現在地に変更する
    panZoomMap(lat, lng, null)
}

// 距離ソート用
 function compare(a, b) {
  // Use toUpperCase() to ignore character casing
  const distA = parseInt(a.distance);
  const distB = parseInt(b.distance);
   let comparison = 0;
  if (distA > distB) {
    comparison = 1;
  } else if (distA < distB) {
    comparison = -1;
  }
  return comparison;
}

// 該当する位置にマーカーを表示
function createMarker(options) {
    // マップ情報を保持しているmapオブジェクトを指定
    options.map = map;
    // Markerクラスのオブジェクトmarkerを作成
    var marker = new google.maps.Marker(options);
    // 各施設の吹き出し(情報ウインドウ)に表示させる処理
    var infoWnd = new google.maps.InfoWindow();
    infoWnd.setContent(options.text);
    // addListenerメソッドを使ってイベントリスナーを登録
    google.maps.event.addListener(marker, 'click', function() {
            infoWnd.open(map, marker);
    });
    return marker;
}

/**
* 指定位置を中心に地図を拡大・移動する関数
*/
function panZoomMap(lat, lng, zoomNum) {
  if (lat != null && lng != null) {
    // 地図の位置座標を絶対的に移動する。
    map.panTo(new google.maps.LatLng(Number(lat), Number(lng)));
  }
  if (zoomNum != null) {
    // 	ズーム値を設定する。
    map.setZoom(Number(zoomNum));
  }
}

  function getAddress(latlng) {

  // ジオコーダのコンストラクタ
  var geocoder = new google.maps.Geocoder();

  // geocodeリクエストを実行。
  // 第１引数はGeocoderRequest。緯度経度⇒住所の変換時はlatLngプロパティを入れればOK。
  // 第２引数はコールバック関数。
  geocoder.geocode({
    latLng: latlng
  }, function(results, status) {
    console.log(results)
    if (status == google.maps.GeocoderStatus.OK) {
      // 結果が帰ってきたら、7番目の配列を取得する
      if (results.length > 0) {
          // 住所を取得(「日本、 」を削除)
          for(i=0; i<results.length; i++) {
            console.log(results[i].types)
            var array = [ "locality", "political" ];
            if (array.toString() == results[i].types) {
                address = results[i].formatted_address.replace('日本、', '');
            }
          }
      }
    } else if (status == google.maps.GeocoderStatus.ERROR) {
      alert("サーバとの通信時に何らかのエラーが発生しました。");
    } else if (status == google.maps.GeocoderStatus.INVALID_REQUEST) {
      alert("リクエストに問題があり、エラーが発生しました。");
    } else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
      alert("クエリの上限値を超えたため、エラーが発生しました。");
    } else if (status == google.maps.GeocoderStatus.REQUEST_DENIED) {
      alert("このページではジオコーダの利用が許可されていないため、エラーが発生しました。");
    } else if (status == google.maps.GeocoderStatus.UNKNOWN_ERROR) {
      alert("サーバ側でなんらかのトラブルが発生したため、エラーが発生しました。");
    } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
      alert("存在しない住所のため、見つかりませんでした。");
    } else {
      alert("原因不明のエラーが発生しました。");
    }
  });
}

function open_sub_category() {
    document.getElementById("nav-input").checked = false;
    document.getElementById("overlay_sub_category").style.display = "block";
    document.getElementById("popup_sub_category").style.display = "block";
    // 現在T_User_Categoryに登録中のチェックボックスを取得
    $.get( '../api/' + cookie_id + '/crud_user_category/')
    // 結果受け取り
    .done(function( dataList ) {
        dataList.forEach(function(data) {
            $("input[type='checkbox']").map(function() {
                 if ($(this).parents('table').attr('value') == data.category_id && $(this).val() == data.sub_category_id){
                    $(this).prop("checked",true);
                 }
            })
        });
    })
}

function close_sub_category() {
    document.getElementById("overlay_sub_category").style.display = "none";
    document.getElementById("popup_sub_category").style.display = "none";
}

/**
* DateTimeを任意のフォーマットへ変換する関数
*/

function dateToFormatString(date, fmt, locale, pad) {
    // %fmt% を日付時刻表記に。
    // 引数
    //  date:  Dateオブジェクト
    //  fmt:   フォーマット文字列、%YYYY%年%MM%月%DD%日、など。
    //  locale:地域指定。デフォルト（入力なし）の場合はja-JP（日本）。現在他に対応しているのはen-US（英語）のみ。
    //  pad:   パディング（桁数を埋める）文字列。デフォルト（入力なし）の場合は0。
    // 例：2016年03月02日15時24分09秒
    // %YYYY%:4桁年（2016）
    // %YY%:2桁年（16）
    // %MMMM%:月の長い表記、日本語では数字のみ、英語ではMarchなど（3）
    // %MMM%:月の短い表記、日本語では数字のみ、英語ではMar.など（3）
    // %MM%:2桁月（03）
    // %M%:月（3）
    // %DD%:2桁日（02）
    // %D%:日（2）
    // %HH%:2桁で表した24時間表記の時（15）
    // %H%:24時間表記の時（15）
    // %h%:2桁で表した12時間表記の時（03）
    // %h%:12時間表記の時（3）
    // %A%:AM/PM表記（PM）
    // %A%:午前/午後表記（午後）
    // %mm%:2桁分（24）
    // %m%:分（24）
    // %ss%:2桁秒（09）
    // %s%:秒（9）
    // %W%:曜日の長い表記（水曜日）
    // %w%:曜日の短い表記（水）
    var padding = function(n, d, p) {
        p = p || '0';
        return (p.repeat(d) + n).slice(-d);
    };
    var DEFAULT_LOCALE = 'ja-JP';
    var getDataByLocale = function(locale, obj, param) {
        var array = obj[locale] || obj[DEFAULT_LOCALE];
        return array[param];
    };
    var format = {
        'YYYY': function() { return padding(date.getFullYear(), 4, pad); },
        'YY': function() { return padding(date.getFullYear() % 100, 2, pad); },
        'MMMM': function(locale) {
            var month = {
                'ja-JP': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
                'en-US': ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'],
            };
            return getDataByLocale(locale, month, date.getMonth());
        },
        'MMM': function(locale) {
            var month = {
                'ja-JP': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
                'en-US': ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June',
                          'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'],
            };
            return getDataByLocale(locale, month, date.getMonth());
        },
        'MM': function() { return padding(date.getMonth()+1, 2, pad); },
        'M': function() { return date.getMonth()+1; },
        'DD': function() { return padding(date.getDate(), 2, pad); },
        'D': function() { return date.getDate(); },
        'HH': function() { return padding(date.getHours(), 2, pad); },
        'H': function() { return date.getHours(); },
        'hh': function() { return padding(date.getHours() % 12, 2, pad); },
        'h': function() { return date.getHours() % 12; },
        'mm': function() { return padding(date.getMinutes(), 2, pad); },
        'm': function() { return date.getMinutes(); },
        'ss': function() { return padding(date.getSeconds(), 2, pad); },
        's': function() { return date.getSeconds(); },
        'A': function() {
            return date.getHours() < 12 ? 'AM' : 'PM';
        },
        'a': function(locale) {
            var ampm = {
                'ja-JP': ['午前', '午後'],
                'en-US': ['am', 'pm'],
            };
            return getDataByLocale(locale, ampm, date.getHours() < 12 ? 0 : 1);
        },
        'W': function(locale) {
            var weekday = {
                'ja-JP': ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
                'en-US': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            };
            return getDataByLocale(locale, weekday, date.getDay());
        },
        'w': function(locale) {
            var weekday = {
                'ja-JP': ['日', '月', '火', '水', '木', '金', '土'],
                'en-US':  ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
            };
            return getDataByLocale(locale, weekday, date.getDay());
        },
    };
    var fmtstr = ['']; // %%（%として出力される）用に空文字をセット。
    Object.keys(format).forEach(function(key) {
        fmtstr.push(key); // ['', 'YYYY', 'YY', 'MMMM',... 'W', 'w']のような配列が生成される。
    })
    var re = new RegExp('%(' + fmtstr.join('|') + ')%', 'g');
    // /%(|YYYY|YY|MMMM|...W|w)%/g のような正規表現が生成される。
    var replaceFn = function(match, fmt) {
    // match には%YYYY%などのマッチした文字列が、fmtにはYYYYなどの%を除くフォーマット文字列が入る。
        if(fmt === '') {
            return '%';
        }
        var func = format[fmt];
        // fmtがYYYYなら、format['YYYY']がfuncに代入される。つまり、
        // function() { return padding(date.getFullYear(), 4, pad); }という関数が代入される。
        if(func === undefined) {
            //存在しないフォーマット
            return match;
        }
        return func(locale);
    };
    return fmt.replace(re, replaceFn);
}

// 検索履歴をポップアップに表示する
function makeHistoryTable(h_num, s_place, s_time, s_category) {
    // テーブル取得、表示、初期化
    var history_tbl = document.getElementById('history');
    while (history_tbl.rows.length > 1) history_tbl.deleteRow(1);
    console.log(history_tbl);
    for(var i = 0; i < h_num ; i++){
        // 一覧に表示する
        var history_tr = history_tbl.insertRow( history_tbl.rows.length );
        var history_td;
        for(var j = 0; j < history_id_list.length ; j++){
            history_td = history_tr.insertCell( history_tr.cells.length );
            history_td.id = history_id_list[j];
            switch (j) {
                // 検索場所
                case 0:
                    history_td.appendChild( document.createTextNode(s_place[i]) );
                    console.log(history_tbl);
                    break;
                // 検索時間
                case 1:
                    history_td.appendChild( document.createTextNode(s_time[i]) );
                    break;
                // カテゴリ
                case 2:
                    history_td.appendChild( document.createTextNode(s_category[i]) );
                    break;
            }
        }
    }
}

// 検索履歴取得処理
function openSearchHistory() {
    document.getElementById("nav-input").checked = false;
    document.getElementById("history_overlay").style.display = "block";
    console.log(document.getElementById("history_list").scrollHeight);
        // ユーザーIDに紐づく検索履歴を取得
        $.ajax({
        'url':'../api/' + cookie_id + '/get_search_history/',
        'type':'GET',
        'data': {},
        'dataType':'json',
        'success':function(response){
            var array_history_place = [];
            var array_history_time = [];
            var array_history_category = [];
            var history_num = response.length
            for(var i in response){
                array_history_place.push(response[i].search_place);
                array_history_time.push(response[i].search_time.replace("T"," "));
                array_history_category.push(response[i].category_name);
            }
            makeHistoryTable(history_num, array_history_place, array_history_time, array_history_category)
        }
    })
    document.getElementById("history_popup").style.display = "block";
}
// 検索履歴ポップアップのクローズ処理
function closeSearchHistory() {
    document.getElementById("history_list").scrollTop = 0;
    document.getElementById("history_overlay").style.display = "none";
    document.getElementById("history_popup").style.display = "none";
}

// サブカテゴリ編集の確認メッセージ
function confirm_sub_category() {
	// 「OK」時の処理開始 ＋ 確認ダイアログの表示
	if(window.confirm("サブカテゴリ編集を完了しますか？")){
	editUserCategory();
	// TODO: DB関係の実装
	}
	// 「キャンセル」時の処理開始
	else{
		window.alert("キャンセルされました"); // 警告ダイアログを表示
	}
}

function editUserCategory() {

    // T_User_Categoryに存在する、クッキーIDに紐づくデータを全て削除(何故かログは出ない)
    $.ajax({
        'url':'../api/' + cookie_id + '/crud_user_category',
        'type':'DELETE',
        'data':{},
        'dataType':'json',
        'success':function(response){
            console.log("ユーザIDに紐づくデータを削除")
        },
    });

    var data_list = [];
    var entry_date = dateToFormatString(new Date(), '%YYYY%-%MM%-%DD% %HH%:%mm%:%ss%');

    var $sub_category = $("input[type='checkbox']:checked").map(function() {
        var data = {
            'user_id': cookie_id,
            'category_id': $(this).parents('table').attr('value'),
            'sub_category_id': $(this).val(),
            'entry_date': entry_date
        }
        data_list.push(data)
        });
    console.log(data_list)

    // データを一つずつpostする
    data_list.forEach(function(data) {
        $.post( '../api/' + cookie_id + '/crud_user_category', data);
    });

}

// ページ読み込み完了後、Googleマップを表示
google.maps.event.addDomListener(window, 'load', initialize);
