// map.js

// 初始化地圖
function initMap() {
    // 設定地圖中心點與縮放級別
    const mapCenter = { lat: 25.0330, lng: 121.5654 }; // 這裡以台北 101 的經緯度為例

    // 建立地圖物件
    const map = new google.maps.Map(document.getElementById('map'), {
        center: mapCenter,
        zoom: 12,
    });

    // 在地圖上添加標記
    const marker = new google.maps.Marker({
        position: mapCenter,
        map: map,
        title: '台北 101',
    });

    // 其他地圖功能可在此添加，例如路線規劃、資訊視窗等
}
