// 初始化 Leaflet 地圖
document.addEventListener("DOMContentLoaded", function() {
    // 設置地圖的初始位置和縮放級別
    var map = L.map('map').setView([25.0330, 121.5654], 13); // 台北市位置

    // 添加 OpenStreetMap 圖層
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 可選：在地圖上添加一個標記
    L.marker([25.0330, 121.5654]).addTo(map)
        .bindPopup('台北市中心').openPopup();
});
