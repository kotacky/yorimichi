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
// ズーム
var zoom;
// 表示件数
var restriction_number = 5;
// IDリスト
var id_list = ["td1", "td2"];
//現在位置取得

//検索ボタン有効化切り替え
$(function() {
    // ラジオボタンチェック時に有効化
    $(":radio").on('change', function() {
        if (document.getElementById("search_btn").disabled == true) {
            document.getElementById("search_btn").disabled = false;
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

// 検索結果を受け取る
function Result_Places(results, status){
    // Placesが検家に成功したかとマうかをチェック
    if(status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
        // 検索結果の数だけ反復処理を変数placeに格納
        var place = restriction_number;
        createMarker({
            text : place.name,
            position : place.geometry.location
        });
        }
    }
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
                query : array,
                radius : 5000,
                location : latlng
            };
            service.textSearch(request, result_search);
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
                    var place_link = document.createElement('a');
                    place_link.href = "https://www.google.co.jp/search?q=" + results[i].name;
                    place_link.innerHTML = results[i].name;
                    td.appendChild( place_link );
                    break;
            }
        }
        bounds.extend(results[i].geometry.location);
    }
    map.fitBounds(bounds);
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


// ページ読み込み完了後、Googleマップを表示
google.maps.event.addDomListener(window, 'load', initialize);