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

// cookieID取得用
var r = document.cookie.split(';');
r.forEach(function(value) {

    // cookie名と値に分ける
    var content = value.split('=');
    // 実際に使用するcookieID
    var cookieId = content[1];
    // テスト用で出力(cookieIDを使って運用ができる確認とれたら消す)
    console.log(cookieId);
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
    console.log(address);
    // DBからサブカテゴリを取得
    $.ajax({
        'url':'../api/' + $("input[name='radio_item']:checked").val() + '/search/',
        'type':'GET',
        'data':{},
        'dataType':'json',
        'success':function(response){
            var array = [];
            for(var i in response){
                array.push(response[i].sub_category_name);
            }
            console.log(array)
            service = new google.maps.places.PlacesService(map);
            // input要素に入力されたキーワードを検索の条件に設定
            var request = {
                // types : ['book_store' ,'library']  提供されているサブカテゴリにするならコレを使う
                // keyword検索は、現状「DBに一つだけ登録されている」状態じゃないと、まともに動かない
                keyword :  array,
                location : latlng,
                rankBy: google.maps.places.RankBy.DISTANCE
            };
            service.nearbySearch(request, result_search);
        },
    });
}

// 検索の結果を受け取る
function result_search(results, status) {
    // テーブル取得、表示、初期化
    var tbl = document.getElementById('place_list');
    tbl.style.display = "";
    while (tbl.rows.length > 1) tbl.deleteRow(1);
    // 検索結果が0件の場合、リターン
    if (results.length == 0) {
        return;
    }
    // 境界(Bounding box)のインスタンスを作成する
    var bounds = new google.maps.LatLngBounds();
    console.log(tbl);
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
                    //施設の緯度経度と現在位置の距離を算出
                    var facilitylat = results[i].geometry.location.lat() ;
                    var facilitylng = results[i].geometry.location.lng() ;
                    var faclatlng = new google.maps.LatLng( facilitylat , facilitylng ) ;
                    var distance = google.maps.geometry.spherical.computeDistanceBetween(latlng, faclatlng);
                    var splitdistance =String(distance).split(["."])
                    td.appendChild( document.createTextNode(splitdistance[0] + "m") );
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
    if (status == google.maps.GeocoderStatus.OK) {
      // 結果が帰ってきたら、7番目の配列を取得する
      if (results.length > 0) {
          // 住所を取得(「日本、 」を削除)
          address = results[6].formatted_address.replace('日本、', '');
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


/**
* マスタ登録をするメソッド
*/
function registerMaster() {
    // まず、存在するM_Categoryを削除する
    $.ajax({
        'url':'../api/crud_m_category',
        'type':'DELETE',
        'data':{
        },
        'dataType':'json',
        'success':function(response){
            console.log("M_categoryからデータを削除")
        },
    });
    var data_list = []
    // postしたいデータをJSON形式にして、リストに詰める
    data_list.push(
        {
            'category_id': '001',
            'category_name': 'アミューズメント',
            'sub_category_id': '001',
            'sub_category_name': '映画館',
        },
        {
            'category_id': '001',
            'category_name': 'アミューズメント',
            'sub_category_id': '002',
            'sub_category_name': '博物館',
        }
        // TODO こんな感じで全部のカテゴリ、サブカテゴリを書いてください
    )
    // リストの中のdataを全てpostする
    data_list.forEach(function(data) {
        $.post( '../api/crud_m_category', data);
    });
}


// ページ読み込み完了後、Googleマップを表示
google.maps.event.addDomListener(window, 'load', initialize);